import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const NoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional()
})

export async function GET() {
  const { userId } = auth()
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const notes = await prisma.note.findMany({
      where: { userId },
      include: {
        linkedFrom: {
          include: { targetNote: true }
        },
        linkedTo: {
          include: { sourceNote: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Failed to fetch notes:', {
      error,
      userId,
      stack: error instanceof Error ? error.stack : undefined
    })
    return new NextResponse(
      JSON.stringify({ 
        message: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }),
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // First, ensure the user exists in our database
    let user = await prisma.user.findUnique({
      where: { id: userId }
    })

    // If user doesn't exist, create them
    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            id: userId,
            email: 'placeholder@example.com' // You might want to get this from Clerk
          }
        })
      } catch (error) {
        console.error('Failed to create user:', error)
        return new NextResponse('Failed to create user', { status: 500 })
      }
    }

    const json = await req.json()
    const body = NoteSchema.parse(json)

    const note = await prisma.$transaction(async (tx) => {
      // Create the note
      const note = await tx.note.create({
        data: {
          userId,
          title: body.title,
          content: body.content
        },
        include: {
          linkedFrom: {
            include: { targetNote: true }
          },
          linkedTo: {
            include: { sourceNote: true }
          }
        }
      })

      // Extract and create links
      if (body.content) {
        const linkPattern = /\[\[(.*?)\]\]/g
        const matches = body.content.match(linkPattern) || []
        
        for (const match of matches) {
          const linkedTitle = match.slice(2, -2)
          const linkedNote = await tx.note.findFirst({
            where: {
              userId,
              title: linkedTitle
            }
          })

          if (linkedNote) {
            await tx.noteLink.create({
              data: {
                sourceNoteId: note.id,
                targetNoteId: linkedNote.id
              }
            })
          }
        }
      }

      return note
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error('Failed to create note:', error)
    return new NextResponse(
      JSON.stringify({ 
        message: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }),
      { status: 500 }
    )
  }
} 