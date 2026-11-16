import { verifyFirebaseToken, type VerifiedFirebaseToken } from './auth/verify-firebase-token'
import { createFirestoreGateway, type FirestoreGateway } from './firestore/rest'
import { verifyRegistration, VerificationError } from './registration/verify'
import { finalVerificationSchema, privilegedEnvelopeSchema } from './schemas'
import { resultTransitionSchema } from './schemas'
import { transitionResult } from './results/workflow'

export type Env={FIREBASE_PROJECT_ID:string;FIREBASE_CLIENT_EMAIL:string;FIREBASE_PRIVATE_KEY:string;ALLOWED_ORIGINS:string}
type Dependencies={
  verifyToken:(request:Request,projectId:string)=>Promise<VerifiedFirebaseToken>
  createGateway:(env:Env)=>FirestoreGateway
}
const json=(body:unknown,status=200,headers:HeadersInit={})=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}})
const traceId=()=>crypto.randomUUID().slice(0,8)
const entryPattern=/^[A-Za-z0-9_-]{3,128}$/
const eventPattern=/^[a-z0-9-]{3,80}$/

function checkOrigin(request:Request,env:Env){
  const origin=request.headers.get('Origin')
  const allowlist=env.ALLOWED_ORIGINS.split(',').map((item)=>item.trim()).filter(Boolean)
  return !origin||allowlist.includes(origin)
}

function corsHeaders(request:Request):Record<string,string>{
  const origin=request.headers.get('Origin')
  return origin?{'access-control-allow-origin':origin,'access-control-allow-headers':'authorization, content-type','access-control-allow-methods':'POST, OPTIONS','access-control-max-age':'600','vary':'Origin'}:{}
}

async function parseJson(request:Request){
  const length=Number(request.headers.get('content-length')??0)
  if(length>8192)throw new VerificationError('payload_too_large',413)
  try{return await request.json()}catch{throw new VerificationError('invalid_json',400)}
}

export function createWorker(overrides:Partial<Dependencies>={}){
  const dependencies:Dependencies={verifyToken:verifyFirebaseToken,createGateway:(env)=>createFirestoreGateway(env),...overrides}
  return {async fetch(request:Request,env:Env):Promise<Response>{
    const url=new URL(request.url)
    if(request.method==='GET'&&url.pathname==='/health')return json({success:true,data:{service:'mtqh-pinrang-api',status:'ok'},meta:{schemaVersion:'v1'}})
    if(request.method==='OPTIONS'&&url.pathname.startsWith('/v1/')){
      if(!checkOrigin(request,env))return json({success:false,error:{code:'origin_denied'}},403)
      return new Response(null,{status:204,headers:corsHeaders(request)})
    }
    const responseHeaders=corsHeaders(request)
    if(request.method==='POST'&&url.pathname==='/v1/privileged/validate'){
      if(!checkOrigin(request,env))return json({success:false,error:{code:'origin_denied'}},403,responseHeaders)
      if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))return json({success:false,error:{code:'unsupported_media_type'}},415,responseHeaders)
      try{
        const token=await dependencies.verifyToken(request,env.FIREBASE_PROJECT_ID)
        const body=privilegedEnvelopeSchema.safeParse(await parseJson(request))
        if(!body.success)return json({success:false,error:{code:'invalid_payload',issues:body.error.issues.map((issue)=>({path:issue.path.join('.'),code:issue.code}))}},400,responseHeaders)
        return json({success:true,data:{validated:true,uid:token.sub,eventId:body.data.eventId},meta:{schemaVersion:'v1'}},200,responseHeaders)
      }catch(error){return errorResponse(error,responseHeaders)}
    }
    const match=url.pathname.match(/^\/v1\/events\/([^/]+)\/registrations\/([^/]+)\/verify$/)
    if(request.method==='POST'&&match){
      if(!checkOrigin(request,env))return json({success:false,error:{code:'origin_denied'}},403,responseHeaders)
      if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))return json({success:false,error:{code:'unsupported_media_type'}},415,responseHeaders)
      const eventId=match[1]??'';const entryId=match[2]??''
      if(!eventPattern.test(eventId)||!entryPattern.test(entryId))return json({success:false,error:{code:'invalid_path'}},400,responseHeaders)
      try{
        const token=await dependencies.verifyToken(request,env.FIREBASE_PROJECT_ID)
        const body=finalVerificationSchema.safeParse(await parseJson(request))
        if(!body.success)return json({success:false,error:{code:'invalid_payload',issues:body.error.issues.map((issue)=>({path:issue.path.join('.'),code:issue.code}))}},400,responseHeaders)
        const result=await verifyRegistration({gateway:dependencies.createGateway(env),eventId,entryId,uid:token.sub,...body.data})
        return json({success:true,data:result,meta:{schemaVersion:'v1'}},200,responseHeaders)
      }catch(error){return errorResponse(error,responseHeaders)}
    }
    const resultMatch=url.pathname.match(/^\/v1\/events\/([^/]+)\/results\/([^/]+)\/transition$/)
    if(request.method==='POST'&&resultMatch){
      if(!checkOrigin(request,env))return json({success:false,error:{code:'origin_denied'}},403,responseHeaders)
      if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))return json({success:false,error:{code:'unsupported_media_type'}},415,responseHeaders)
      const eventId=resultMatch[1]??'';const resultId=resultMatch[2]??''
      if(!eventPattern.test(eventId)||!entryPattern.test(resultId))return json({success:false,error:{code:'invalid_path'}},400,responseHeaders)
      try{
        const token=await dependencies.verifyToken(request,env.FIREBASE_PROJECT_ID)
        const body=resultTransitionSchema.safeParse(await parseJson(request))
        if(!body.success)return json({success:false,error:{code:'invalid_payload',issues:body.error.issues.map((issue)=>({path:issue.path.join('.'),code:issue.code}))}},400,responseHeaders)
        const result=await transitionResult({gateway:dependencies.createGateway(env),eventId,resultId,uid:token.sub,...body.data})
        return json({success:true,data:result,meta:{schemaVersion:'v1'}},200,responseHeaders)
      }catch(error){return errorResponse(error,responseHeaders)}
    }
    return json({success:false,error:{code:'not_found'}},404)
  }}
}

function errorResponse(error:unknown,headers:HeadersInit={}){
  if(error instanceof VerificationError)return json({success:false,error:{code:error.code,traceId:traceId()}},error.status,headers)
  const code=error instanceof Error?error.message:'internal_error'
  const joseCode=typeof error==='object'&&error!==null&&'code' in error?String(error.code):''
  if(code==='missing_token'||code==='invalid_subject'||joseCode.startsWith('ERR_J'))return json({success:false,error:{code:code==='missing_token'?'missing_token':'invalid_token',traceId:traceId()}},401,headers)
  if(code==='write_conflict')return json({success:false,error:{code,traceId:traceId()}},409,headers)
  return json({success:false,error:{code:'internal_error',traceId:traceId()}},500,headers)
}

export default createWorker()
