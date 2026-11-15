import { describe,expect,it } from 'vitest'
import worker from './index'
const env={FIREBASE_PROJECT_ID:'mtqhpinrang2027',ALLOWED_ORIGINS:'http://localhost:5173'}
describe('worker boundary',()=>{
  it('menyediakan health response tanpa data sensitif',async()=>{const response=await worker.fetch(new Request('https://api.example.test/health'),env);expect(response.status).toBe(200);expect(await response.json()).toMatchObject({success:true,meta:{schemaVersion:'v1'}})})
  it('menolak request privileged tanpa bearer token',async()=>{const response=await worker.fetch(new Request('https://api.example.test/v1/privileged/validate',{method:'POST',headers:{Origin:'http://localhost:5173','content-type':'application/json'},body:JSON.stringify({})}),env);expect(response.status).toBe(401);expect(await response.json()).toMatchObject({success:false,error:{code:'missing_token'}})})
  it('menolak origin di luar allowlist sebelum token diproses',async()=>{const response=await worker.fetch(new Request('https://api.example.test/v1/privileged/validate',{method:'POST',headers:{Origin:'https://jahat.example','content-type':'application/json'},body:'{}'}),env);expect(response.status).toBe(403)})
})
