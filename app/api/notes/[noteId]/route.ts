import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const UpdateNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  linkedTo: z.array(z.string()).optional()
})

export async function PATCH(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const json = await req.json()
    const body = UpdateNoteSchema.parse(json)

    const updatedNote = await prisma.note.update({
      where: { 
        id: params.noteId,
        userId 
      },
      data: {
        title: body.title,
        content: body.content
      },
      include: {
        linkedTo: {
          include: {
            targetNote: true
          }
        },
        linkedFrom: {
          include: {
            sourceNote: true
          }
        }
      }
    })

    return NextResponse.json(updatedNote)
  } catch (error) {
    console.error('Failed to update note:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    await prisma.note.delete({
      where: {
        id: params.noteId,
        userId
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Failed to delete note:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 