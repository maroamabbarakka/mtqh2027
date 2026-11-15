import { privilegedEnvelopeSchema } from './schemas'
import { verifyFirebaseToken } from './auth/verify-firebase-token'

type Env={FIREBASE_PROJECT_ID:string;ALLOWED_ORIGINS:string}
const json=(body:unknown,status=200,headers:HeadersInit={})=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}})
const traceId=()=>crypto.randomUUID().slice(0,8)

export default {async fetch(request:Request,env:Env):Promise<Response>{
  const url=new URL(request.url)
  if(request.method==='GET'&&url.pathname==='/health')return json({success:true,data:{service:'mtqh-pinrang-api',status:'ok'},meta:{schemaVersion:'v1'}})
  if(request.method==='POST'&&url.pathname==='/v1/privileged/validate'){
    const origin=request.headers.get('Origin');const allowlist=env.ALLOWED_ORIGINS.split(',').map((item)=>item.trim())
    if(origin&&!allowlist.includes(origin))return json({success:false,error:{code:'origin_denied'}},403)
    try{
      const token=await verifyFirebaseToken(request,env.FIREBASE_PROJECT_ID)
      const body=privilegedEnvelopeSchema.safeParse(await request.json())
      if(!body.success)return json({success:false,error:{code:'invalid_payload',issues:body.error.issues.map((issue)=>({path:issue.path.join('.'),code:issue.code}))}},400)
      // Validasi role server-trusted dan transaksi Firestore ditambahkan per endpoint bisnis; tidak ada write pada skeleton ini.
      return json({success:true,data:{validated:true,uid:token.sub,eventId:body.data.eventId},meta:{schemaVersion:'v1'}})
    }catch(error){const code=error instanceof Error&&error.message==='missing_token'?'missing_token':'invalid_token';return json({success:false,error:{code,traceId:traceId()}},401)}
  }
  return json({success:false,error:{code:'not_found'}},404)
}}
