import { stringValue, valueOf, type FirestoreGateway, type FirestoreRecord } from '../firestore/rest'
import { VerificationError } from '../registration/verify'

type Action='submit'|'start_review'|'return'|'approve'
const allowedRoles:Record<Action,Set<string>>={
  submit:new Set(['branch_admin']), start_review:new Set(['event_admin']), return:new Set(['event_admin']), approve:new Set(['event_admin']),
}

function eventAccess(assignment:FirestoreRecord,eventId:string){
  if(assignment.disabled===true)return undefined
  return (assignment.accessByEvent as Record<string,{roles?:unknown;branchIds?:unknown}>|undefined)?.[eventId]
}

function authorize(assignment:FirestoreRecord,eventId:string,action:Action,branchId:string){
  const access=eventAccess(assignment,eventId)
  const roles=Array.isArray(access?.roles)?access.roles.filter((role):role is string=>typeof role==='string'):[]
  if(!roles.some((role)=>allowedRoles[action].has(role)))return false
  if(action==='submit')return Array.isArray(access?.branchIds)&&access.branchIds.includes(branchId)
  return true
}

async function validateWinners(gateway:FirestoreGateway,eventId:string,submission:FirestoreRecord){
  const divisionId=String(submission.divisionId??'')
  const division=await gateway.get(`events/${eventId}/divisions/${divisionId}`)
  if(!division||division.data.branchId!==submission.branchId)throw new VerificationError('division_mismatch',409)
  const slots=new Set((Array.isArray(division.data.awardSlots)?division.data.awardSlots:[]).map((slot)=>typeof slot==='object'&&slot?String((slot as {id?:unknown}).id):''))
  const winners=Array.isArray(submission.winners)?submission.winners:[]
  if(winners.length<1||winners.length>6)throw new VerificationError('invalid_winners',409)
  const awards=new Set<string>();const entries=new Set<string>()
  for(const raw of winners){
    if(typeof raw!=='object'||!raw)throw new VerificationError('invalid_winners',409)
    const winner=raw as {awardId?:unknown;entryId?:unknown};const awardId=String(winner.awardId??'');const entryId=String(winner.entryId??'')
    if(!slots.has(awardId)||awards.has(awardId)||entries.has(entryId))throw new VerificationError('invalid_winners',409)
    const registration=await gateway.get(`events/${eventId}/registrations/${entryId}`)
    if(!registration||registration.data.status!=='verified'||registration.data.divisionId!==divisionId)throw new VerificationError('winner_not_verified',409)
    awards.add(awardId);entries.add(entryId)
  }
  return winners
}

export async function transitionResult(input:{gateway:FirestoreGateway;eventId:string;resultId:string;uid:string;idempotencyKey:string;action:Action;reason?:string}){
  const {gateway,eventId,resultId,uid,idempotencyKey,action,reason}=input
  const assignment=await gateway.get(`roleAssignments/${uid}`)
  const path=`events/${eventId}/resultSubmissions/${resultId}`
  const submission=await gateway.get(path)
  if(!submission)throw new VerificationError('result_not_found',404)
  if(!assignment||!authorize(assignment.data,eventId,action,String(submission.data.branchId??'')))throw new VerificationError('permission_denied',403)
  const auditPath=`events/${eventId}/eventAudit/${idempotencyKey}`
  const prior=await gateway.get(auditPath)
  const auditAction=`result_${action}`
  if(prior){
    if(prior.data.action===auditAction&&prior.data.resourceId===resultId&&prior.data.actorUid===uid)return {resultId,status:submission.data.status,replayed:true}
    throw new VerificationError('idempotency_key_reused',409)
  }
  const data=submission.data
  const expected:Record<Action,string>={submit:'draft',start_review:'submitted',return:'under_review',approve:'under_review'}
  const next:Record<Action,string>={submit:'submitted',start_review:'under_review',return:'needs_revision',approve:'approved'}
  if(data.status!==expected[action])throw new VerificationError('invalid_status_transition',409)
  if(action==='submit'&&data.createdBy!==uid)throw new VerificationError('submitter_mismatch',403)
  if(action!=='submit'&&data.createdBy===uid)throw new VerificationError('separation_of_duties_required',403)
  if((action==='return'||action==='approve')&&data.reviewedBy!==uid)throw new VerificationError('reviewer_mismatch',403)
  const winners=await validateWinners(gateway,eventId,data)
  const fields:Record<string,unknown>={status:stringValue(next[action]),updatedBy:stringValue(uid),idempotencyKey:stringValue(idempotencyKey)}
  const masks=['status','updatedBy','idempotencyKey'];const transforms=[{fieldPath:'updatedAt',setToServerValue:'REQUEST_TIME'}]
  if(action==='submit'){fields.submittedBy=stringValue(uid);masks.push('submittedBy');transforms.push({fieldPath:'submittedAt',setToServerValue:'REQUEST_TIME'})}
  if(action==='start_review'){fields.reviewedBy=stringValue(uid);masks.push('reviewedBy');transforms.push({fieldPath:'reviewedAt',setToServerValue:'REQUEST_TIME'})}
  if(action==='return'){fields.reviewReason=stringValue(reason??'');masks.push('reviewReason')}
  const writes:unknown[]=[{update:{name:gateway.documentName(path),fields},updateMask:{fieldPaths:masks},updateTransforms:transforms,currentDocument:{updateTime:submission.updateTime}}]
  if(action==='approve'){
    const officialPath=`events/${eventId}/officialResults/${String(data.divisionId)}`
    const official=await gateway.get(officialPath)
    if(official)throw new VerificationError('official_result_exists',409)
    writes.push({update:{name:gateway.documentName(officialPath),fields:{eventId:stringValue(eventId),divisionId:stringValue(String(data.divisionId)),branchId:stringValue(String(data.branchId)),sourceResultId:stringValue(resultId),winners:valueOf(winners),status:stringValue('active'),revision:valueOf(1),approvedBy:stringValue(uid)}},updateTransforms:[{fieldPath:'approvedAt',setToServerValue:'REQUEST_TIME'}],currentDocument:{exists:false}})
  }
  writes.push({update:{name:gateway.documentName(auditPath),fields:{actorUid:stringValue(uid),action:stringValue(auditAction),resourceType:stringValue('resultSubmission'),resourceId:stringValue(resultId),summary:stringValue(`Transisi hasil: ${action}`),idempotencyKey:stringValue(idempotencyKey)}},updateTransforms:[{fieldPath:'createdAt',setToServerValue:'REQUEST_TIME'}],currentDocument:{exists:false}})
  const result=await gateway.commit(writes)
  return {resultId,status:next[action],replayed:false,commitTime:result.commitTime}
}
