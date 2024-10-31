import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const UpdateNoteSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional()
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

    // Simple update if no content change
    if (!body.content) {
      const note = await prisma.note.update({
        where: { 
          id: params.noteId,
          userId 
        },
        data: body,
        include: {
          linkedFrom: {
            include: { targetNote: true }
          },
          linkedTo: {
            include: { sourceNote: true }
          }
        }
      })
      return NextResponse.json(note)
    }

    // For content updates, use a more robust approach
    const note = await prisma.$transaction(async (tx) => {
      // Update note first
      const updatedNote = await tx.note.update({
        where: { 
          id: params.noteId,
          userId 
        },
        data: body
      })

      // Then handle links
      await tx.noteLink.deleteMany({
        where: { sourceNoteId: params.noteId }
      })

      const content = body.content || ''
      const linkPattern = /\[\[(.*?)\]\]/g
      const matches = content.match(linkPattern) || []
      
      if (matches.length > 0) {
        // Use a Map to ensure uniqueness instead of Set
        const uniqueTitles = matches
          .map(match => match.slice(2, -2))
          .filter((value, index, self) => self.indexOf(value) === index)

        const linkedNotes = await tx.note.findMany({
          where: {
            userId,
            title: { in: uniqueTitles }
          },
          select: { id: true, title: true }
        })

        if (linkedNotes.length > 0) {
          await tx.noteLink.createMany({
            data: linkedNotes.map(note => ({
              sourceNoteId: params.noteId,
              targetNoteId: note.id
            }))
          })
        }
      }

      return tx.note.findUnique({
        where: { id: params.noteId },
        include: {
          linkedFrom: {
            include: { targetNote: true }
          },
          linkedTo: {
            include: { sourceNote: true }
          }
        }
      })
    }, {
      maxWait: 5000, // 5 seconds max wait
      timeout: 10000 // 10 seconds timeout
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error('Failed to update note:', error)
    return new NextResponse(
      JSON.stringify({ 
        message: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }),
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  const { userId } = auth()
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const note = await prisma.note.findUnique({
      where: { id: params.noteId }
    })

    if (!note || note.userId !== userId) {
      return new NextResponse('Not found', { status: 404 })
    }

    await prisma.note.delete({
      where: { id: params.noteId }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Failed to delete note:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 