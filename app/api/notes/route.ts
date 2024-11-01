import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const NoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  linkedTo: z.array(z.string()).optional()
})

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const notes = await prisma.note.findMany({
      where: { userId },
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
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Failed to fetch notes:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const json = await req.json()
    const body = NoteSchema.parse(json)

    const note = await prisma.note.create({
      data: {
        title: body.title,
        content: body.content || '',
        userId,
        linkedTo: {
          create: body.linkedTo?.map(targetId => ({
            targetNote: {
              connect: { id: targetId }
            }
          })) || []
        }
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

    return NextResponse.json(note)
  } catch (error) {
    console.error('Failed to create note:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 