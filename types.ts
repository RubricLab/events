import type { z } from 'zod'

export type GenericEventType = Record<string, z.infer<z.ZodTypeAny>>
