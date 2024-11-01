import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get the current user from Clerk
    const user = await currentUser()
    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    // Get the primary email address
    const primaryEmail = user.emailAddresses.find(
      email => email.id === user.primaryEmailAddressId
    )?.emailAddress

    if (!primaryEmail) {
      return new NextResponse('Email not found', { status: 400 })
    }

    // Upsert the user (create if not exists, update if exists)
    const dbUser = await prisma.user.upsert({
      where: { id: userId },
      update: {
        email: primaryEmail,
      },
      create: {
        id: userId,
        email: primaryEmail,
      },
    })

    return NextResponse.json(dbUser)
  } catch (error) {
    console.error('Failed to sync user:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 