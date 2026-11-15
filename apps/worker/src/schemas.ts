import { z } from 'zod'
export const privilegedEnvelopeSchema=z.object({eventId:z.string().regex(/^[a-z0-9-]{3,80}$/),idempotencyKey:z.uuid(),payload:z.record(z.string(),z.unknown())}).strict()
export type PrivilegedEnvelope=z.infer<typeof privilegedEnvelopeSchema>
