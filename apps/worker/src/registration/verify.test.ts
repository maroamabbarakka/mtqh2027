import { describe, expect, it } from 'vitest'
import type { FirestoreGateway, FirestoreRecord } from '../firestore/rest'
import { verifyRegistration } from './verify'

const eventId='mtqh-pinrang-2027'
const entryId='entry-001'
const uid='verifier-uid'
const idempotencyKey='123e4567-e89b-42d3-a456-426614174000'

function gateway(documents:Record<string,FirestoreRecord|null>,writes:unknown[][]=[]):FirestoreGateway{
  return {
    documentName:(path)=>`projects/demo/databases/(default)/documents/${path}`,
    get:async(path)=>documents[path]===null||documents[path]===undefined?null:{data:documents[path],updateTime:'2026-11-16T00:00:00Z'},
    commit:async(next)=>{writes.push(next);return {commitTime:'2026-11-16T00:00:01Z'}},
  }
}

function validDocuments():Record<string,FirestoreRecord|null>{return {
  [`roleAssignments/${uid}`]:{disabled:false,accessByEvent:{[eventId]:{roles:['verifier']}}},
  [`events/${eventId}/eventAudit/${idempotencyKey}`]:null,
  [`events/${eventId}/registrations/${entryId}`]:{eventId,status:'under_review',eligibilityStatus:'needs_manual_review',createdBy:'creator-uid',reviewedBy:uid},
}}

const execute=(documents=validDocuments(),writes:unknown[][]=[])=>verifyRegistration({gateway:gateway(documents,writes),eventId,entryId,uid,idempotencyKey,note:'Berkas administrasi telah diperiksa lengkap.'})

describe('final registration verification',()=>{
  it('menulis status dan audit dalam satu commit dengan precondition',async()=>{
    const writes:unknown[][]=[]
    await expect(execute(validDocuments(),writes)).resolves.toMatchObject({status:'verified',replayed:false})
    expect(writes).toHaveLength(1)
    expect(writes[0]).toHaveLength(2)
    expect(writes[0]?.[0]).toMatchObject({currentDocument:{updateTime:'2026-11-16T00:00:00Z'}})
    expect(writes[0]?.[1]).toMatchObject({currentDocument:{exists:false}})
  })

  it('mengembalikan sukses replay tanpa commit kedua',async()=>{
    const documents=validDocuments()
    documents[`events/${eventId}/eventAudit/${idempotencyKey}`]={action:'registration_verified',resourceId:entryId,actorUid:uid}
    const writes:unknown[][]=[]
    await expect(execute(documents,writes)).resolves.toMatchObject({status:'verified',replayed:true})
    expect(writes).toHaveLength(0)
  })

  it('menolak role yang tidak berhak',async()=>{
    const documents=validDocuments()
    documents[`roleAssignments/${uid}`]={disabled:false,accessByEvent:{[eventId]:{roles:['kafilah_admin']}}}
    await expect(execute(documents)).rejects.toMatchObject({code:'permission_denied',status:403})
  })

  it('menolak reviewer yang bukan pemegang pemeriksaan',async()=>{
    const documents=validDocuments()
    documents[`events/${eventId}/registrations/${entryId}`]={...documents[`events/${eventId}/registrations/${entryId}`],reviewedBy:'other-verifier'}
    await expect(execute(documents)).rejects.toMatchObject({code:'reviewer_mismatch',status:403})
  })

  it('menolak pembuat memverifikasi datanya sendiri',async()=>{
    const documents=validDocuments()
    documents[`events/${eventId}/registrations/${entryId}`]={...documents[`events/${eventId}/registrations/${entryId}`],createdBy:uid}
    await expect(execute(documents)).rejects.toMatchObject({code:'separation_of_duties_required',status:403})
  })

  it('menolak transisi dari status selain under_review',async()=>{
    const documents=validDocuments()
    documents[`events/${eventId}/registrations/${entryId}`]={...documents[`events/${eventId}/registrations/${entryId}`],status:'submitted'}
    await expect(execute(documents)).rejects.toMatchObject({code:'invalid_status_transition',status:409})
  })
})
