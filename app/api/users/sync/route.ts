import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { id: userId }
    })

    // If not, create them
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: 'placeholder@example.com' // You might want to get this from Clerk
        }
      })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to sync user:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 