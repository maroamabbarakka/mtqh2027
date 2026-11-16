import { describe,expect,it } from 'vitest'
import worker,{createWorker} from './index'
import type { FirestoreGateway } from './firestore/rest'
const env={FIREBASE_PROJECT_ID:'mtqhpinrang2027',FIREBASE_CLIENT_EMAIL:'unused@example.test',FIREBASE_PRIVATE_KEY:'unused',ALLOWED_ORIGINS:'http://localhost:5173'}
describe('worker boundary',()=>{
  it('menyediakan health response tanpa data sensitif',async()=>{const response=await worker.fetch(new Request('https://api.example.test/health'),env);expect(response.status).toBe(200);expect(await response.json()).toMatchObject({success:true,meta:{schemaVersion:'v1'}})})
  it('menolak request privileged tanpa bearer token',async()=>{const response=await worker.fetch(new Request('https://api.example.test/v1/privileged/validate',{method:'POST',headers:{Origin:'http://localhost:5173','content-type':'application/json'},body:JSON.stringify({})}),env);expect(response.status).toBe(401);expect(await response.json()).toMatchObject({success:false,error:{code:'missing_token'}})})
  it('menolak origin di luar allowlist sebelum token diproses',async()=>{const response=await worker.fetch(new Request('https://api.example.test/v1/privileged/validate',{method:'POST',headers:{Origin:'https://jahat.example','content-type':'application/json'},body:'{}'}),env);expect(response.status).toBe(403)})
  it('melayani preflight hanya untuk origin yang diizinkan',async()=>{const response=await worker.fetch(new Request('https://api.example.test/v1/events/demo/registrations/entry/verify',{method:'OPTIONS',headers:{Origin:'http://localhost:5173','Access-Control-Request-Method':'POST'}}),env);expect(response.status).toBe(204);expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:5173')})
  it('memproses endpoint verifikasi melalui boundary terautentikasi',async()=>{
    const documents:Record<string,Record<string,unknown>|null>={
      'roleAssignments/verifier-uid':{disabled:false,accessByEvent:{'mtqh-pinrang-2027':{roles:['verifier']}}},
      'events/mtqh-pinrang-2027/eventAudit/123e4567-e89b-42d3-a456-426614174000':null,
      'events/mtqh-pinrang-2027/registrations/entry-001':{eventId:'mtqh-pinrang-2027',status:'under_review',eligibilityStatus:'needs_manual_review',createdBy:'creator-uid',reviewedBy:'verifier-uid'},
    }
    const gateway:FirestoreGateway={documentName:(path)=>path,get:async(path)=>documents[path]?{data:documents[path],updateTime:'2026-11-16T00:00:00Z'}:null,commit:async()=>({commitTime:'2026-11-16T00:00:01Z'})}
    const testWorker=createWorker({verifyToken:async()=>({sub:'verifier-uid'}),createGateway:()=>gateway})
    const response=await testWorker.fetch(new Request('https://api.example.test/v1/events/mtqh-pinrang-2027/registrations/entry-001/verify',{method:'POST',headers:{Origin:'http://localhost:5173','content-type':'application/json'},body:JSON.stringify({idempotencyKey:'123e4567-e89b-42d3-a456-426614174000',note:'Berkas administrasi telah diperiksa lengkap.'})}),env)
    expect(response.status).toBe(200)
    expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:5173')
    expect(await response.json()).toMatchObject({success:true,data:{entryId:'entry-001',status:'verified',replayed:false}})
  })
  it('memproses transisi hasil melalui boundary terautentikasi',async()=>{
    const documents:Record<string,Record<string,unknown>|null>={
      'roleAssignments/branch-uid':{disabled:false,accessByEvent:{'mtqh-pinrang-2027':{roles:['branch_admin'],branchIds:['tilawah']}}},
      'events/mtqh-pinrang-2027/resultSubmissions/result-001':{eventId:'mtqh-pinrang-2027',branchId:'tilawah',divisionId:'tilawah-putra',status:'draft',createdBy:'branch-uid',winners:[{awardId:'juara-1',entryId:'entry-1'}]},
      'events/mtqh-pinrang-2027/divisions/tilawah-putra':{branchId:'tilawah',awardSlots:[{id:'juara-1'}]},
      'events/mtqh-pinrang-2027/registrations/entry-1':{status:'verified',divisionId:'tilawah-putra'},
      'events/mtqh-pinrang-2027/eventAudit/123e4567-e89b-42d3-a456-426614174000':null,
    }
    const gateway:FirestoreGateway={documentName:(path)=>path,get:async(path)=>documents[path]?{data:documents[path],updateTime:'2026-11-16T00:00:00Z'}:null,commit:async()=>({commitTime:'2026-11-16T00:00:01Z'})}
    const testWorker=createWorker({verifyToken:async()=>({sub:'branch-uid'}),createGateway:()=>gateway})
    const response=await testWorker.fetch(new Request('https://api.example.test/v1/events/mtqh-pinrang-2027/results/result-001/transition',{method:'POST',headers:{Origin:'http://localhost:5173','content-type':'application/json'},body:JSON.stringify({idempotencyKey:'123e4567-e89b-42d3-a456-426614174000',action:'submit'})}),env)
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({success:true,data:{status:'submitted'}})
  })
})
