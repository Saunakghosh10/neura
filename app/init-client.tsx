'use client'

import { useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'

export function InitClient() {
  const { userId, isLoaded } = useAuth()

  useEffect(() => {
    if (isLoaded && userId) {
      // Sync user with our database
      fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(console.error)
    }
  }, [isLoaded, userId])

  return null
} 