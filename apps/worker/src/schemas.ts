import { z } from 'zod'
export const privilegedEnvelopeSchema=z.object({eventId:z.string().regex(/^[a-z0-9-]{3,80}$/),idempotencyKey:z.uuid(),payload:z.record(z.string(),z.unknown())}).strict()
export type PrivilegedEnvelope=z.infer<typeof privilegedEnvelopeSchema>

export const finalVerificationSchema=z.object({
  idempotencyKey:z.uuid(),
  note:z.string().trim().min(10).max(300),
}).strict()

export const resultTransitionSchema=z.object({
  idempotencyKey:z.uuid(),
  action:z.enum(['submit','start_review','return','approve']),
  reason:z.string().trim().max(300).optional(),
}).strict().superRefine((value,context)=>{
  if(value.action==='return'&&(!value.reason||value.reason.length<10))context.addIssue({code:'custom',path:['reason'],message:'Alasan revisi minimal 10 karakter.'})
})
