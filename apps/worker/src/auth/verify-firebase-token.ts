import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'

const jwks=createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'))
export type VerifiedFirebaseToken=JWTPayload&{sub:string;email?:string}

export async function verifyFirebaseToken(request:Request,projectId:string):Promise<VerifiedFirebaseToken>{
  const authorization=request.headers.get('Authorization')
  if(!authorization?.startsWith('Bearer '))throw new Error('missing_token')
  const token=authorization.slice(7)
  const {payload}=await jwtVerify(token,jwks,{algorithms:['RS256'],audience:projectId,issuer:`https://securetoken.google.com/${projectId}`})
  if(typeof payload.sub!=='string'||payload.sub.length===0||payload.sub.length>128||payload.sub.includes('/'))throw new Error('invalid_subject')
  return payload as VerifiedFirebaseToken
}
