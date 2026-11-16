import { describe,expect,it } from 'vitest'
import type { FirestoreGateway,FirestoreRecord } from '../firestore/rest'
import { transitionResult } from './workflow'

const eventId='mtqh-pinrang-2027',resultId='result-001',branchUid='branch-uid',adminUid='admin-uid'
const key='123e4567-e89b-42d3-a456-426614174000'
function docs(status='draft'):Record<string,FirestoreRecord|null>{return {
  [`roleAssignments/${branchUid}`]:{disabled:false,accessByEvent:{[eventId]:{roles:['branch_admin'],branchIds:['tilawah']}}},
  [`roleAssignments/${adminUid}`]:{disabled:false,accessByEvent:{[eventId]:{roles:['event_admin'],branchIds:[]}}},
  [`events/${eventId}/resultSubmissions/${resultId}`]:{eventId,branchId:'tilawah',divisionId:'tilawah-putra',status,createdBy:branchUid,winners:[{awardId:'juara-1',entryId:'entry-1'}],reviewedBy:status==='under_review'?adminUid:undefined},
  [`events/${eventId}/divisions/tilawah-putra`]:{branchId:'tilawah',awardSlots:[{id:'juara-1',label:'Juara I'}]},
  [`events/${eventId}/registrations/entry-1`]:{status:'verified',divisionId:'tilawah-putra'},
  [`events/${eventId}/eventAudit/${key}`]:null,
  [`events/${eventId}/officialResults/tilawah-putra`]:null,
}}
function gateway(documents:Record<string,FirestoreRecord|null>,commits:unknown[][]=[]):FirestoreGateway{return {documentName:(path)=>path,get:async(path)=>documents[path]===null||documents[path]===undefined?null:{data:documents[path],updateTime:'2026-11-16T00:00:00Z'},commit:async(writes)=>{commits.push(writes);return {commitTime:'2026-11-16T00:00:01Z'}}}}
const run=(documents:Record<string,FirestoreRecord|null>,uid:string,action:'submit'|'start_review'|'return'|'approve',commits:unknown[][]=[],reason?:string)=>transitionResult({gateway:gateway(documents,commits),eventId,resultId,uid,idempotencyKey:key,action,reason})

describe('result transition workflow',()=>{
  it('submit branch admin memvalidasi pemenang dan menulis audit atomik',async()=>{const commits:unknown[][]=[];await expect(run(docs(),branchUid,'submit',commits)).resolves.toMatchObject({status:'submitted',replayed:false});expect(commits[0]).toHaveLength(2);expect(commits[0]?.[0]).toMatchObject({currentDocument:{updateTime:'2026-11-16T00:00:00Z'}})})
  it('event admin memulai review dengan separation of duties',async()=>{const commits:unknown[][]=[];await expect(run(docs('submitted'),adminUid,'start_review',commits)).resolves.toMatchObject({status:'under_review'});expect(commits[0]).toHaveLength(2)})
  it('approval membuat official result, update submission, dan audit dalam satu commit',async()=>{const commits:unknown[][]=[];await expect(run(docs('under_review'),adminUid,'approve',commits)).resolves.toMatchObject({status:'approved'});expect(commits[0]).toHaveLength(3);expect(commits[0]?.[1]).toMatchObject({currentDocument:{exists:false}})})
  it('return mewajibkan reviewer pemegang pemeriksaan',async()=>{const documents=docs('under_review');(documents[`events/${eventId}/resultSubmissions/${resultId}`] as FirestoreRecord).reviewedBy='admin-lain';await expect(run(documents,adminUid,'return',[],'Perbaiki berita acara.')).rejects.toMatchObject({code:'reviewer_mismatch'})})
  it('menolak pemenang yang tidak lagi verified',async()=>{const documents=docs();(documents[`events/${eventId}/registrations/entry-1`] as FirestoreRecord).status='rejected';await expect(run(documents,branchUid,'submit')).rejects.toMatchObject({code:'winner_not_verified'})})
  it('replay idempotensi tidak membuat commit kedua',async()=>{const documents=docs();documents[`events/${eventId}/eventAudit/${key}`]={action:'result_submit',resourceId:resultId,actorUid:branchUid};const commits:unknown[][]=[];await expect(run(documents,branchUid,'submit',commits)).resolves.toMatchObject({replayed:true});expect(commits).toHaveLength(0)})
})
