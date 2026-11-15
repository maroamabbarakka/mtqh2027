import { stringValue, type FirestoreGateway, type FirestoreRecord } from '../firestore/rest'

const verifierRoles = new Set(['event_admin', 'verifier'])

export class VerificationError extends Error {
  constructor(public code: string, public status: number) { super(code) }
}

function hasVerificationRole(assignment: FirestoreRecord, eventId: string) {
  if (assignment.disabled === true) return false
  const access = assignment.accessByEvent as Record<string, unknown> | undefined
  const eventAccess = access?.[eventId] as { roles?: unknown } | undefined
  return Array.isArray(eventAccess?.roles) && eventAccess.roles.some((role) => typeof role === 'string' && verifierRoles.has(role))
}

export async function verifyRegistration(input: {
  gateway: FirestoreGateway
  eventId: string
  entryId: string
  uid: string
  idempotencyKey: string
  note: string
}) {
  const { gateway, eventId, entryId, uid, idempotencyKey, note } = input
  const assignment = await gateway.get(`roleAssignments/${uid}`)
  if (!assignment || !hasVerificationRole(assignment.data, eventId)) throw new VerificationError('permission_denied', 403)

  const auditPath = `events/${eventId}/eventAudit/${idempotencyKey}`
  const priorAudit = await gateway.get(auditPath)
  if (priorAudit) {
    if (priorAudit.data.action === 'registration_verified' && priorAudit.data.resourceId === entryId && priorAudit.data.actorUid === uid) {
      return { entryId, status: 'verified' as const, replayed: true }
    }
    throw new VerificationError('idempotency_key_reused', 409)
  }

  const registrationPath = `events/${eventId}/registrations/${entryId}`
  const registration = await gateway.get(registrationPath)
  if (!registration) throw new VerificationError('registration_not_found', 404)
  const data = registration.data
  if (data.eventId !== eventId) throw new VerificationError('event_mismatch', 409)
  if (data.status !== 'under_review') throw new VerificationError('invalid_status_transition', 409)
  if (data.reviewedBy !== uid) throw new VerificationError('reviewer_mismatch', 403)
  if (data.createdBy === uid) throw new VerificationError('separation_of_duties_required', 403)
  if (data.eligibilityStatus !== 'needs_manual_review') throw new VerificationError('invalid_eligibility_status', 409)

  const registrationName = gateway.documentName(registrationPath)
  const auditName = gateway.documentName(auditPath)
  const result = await gateway.commit([
    {
      update: {
        name: registrationName,
        fields: {
          status: stringValue('verified'),
          eligibilityStatus: stringValue('verified_manual'),
          verifiedBy: stringValue(uid),
          verificationNote: stringValue(note),
          updatedBy: stringValue(uid),
          idempotencyKey: stringValue(idempotencyKey),
        },
      },
      updateMask: { fieldPaths: ['status', 'eligibilityStatus', 'verifiedBy', 'verificationNote', 'updatedBy', 'idempotencyKey'] },
      updateTransforms: [
        { fieldPath: 'verifiedAt', setToServerValue: 'REQUEST_TIME' },
        { fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' },
      ],
      currentDocument: { updateTime: registration.updateTime },
    },
    {
      update: {
        name: auditName,
        fields: {
          actorUid: stringValue(uid),
          action: stringValue('registration_verified'),
          resourceType: stringValue('registration'),
          resourceId: stringValue(entryId),
          summary: stringValue('Pendaftaran diverifikasi melalui pemeriksaan manual'),
          idempotencyKey: stringValue(idempotencyKey),
        },
      },
      updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }],
      currentDocument: { exists: false },
    },
  ])
  return { entryId, status: 'verified' as const, replayed: false, commitTime: result.commitTime }
}
