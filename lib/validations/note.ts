import { z } from 'zod'

export const UpdateNoteSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional().default('')
})

export const CreateNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional().default('')
}) 