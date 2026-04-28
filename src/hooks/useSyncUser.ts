'use client'

import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useQuizStore } from '@/store/quizStore'

export function useSyncUser() {
  const { isSignedIn } = useAuth()
  const syncFromServer = useQuizStore(s => s.syncFromServer)

  useEffect(() => {
    if (isSignedIn) syncFromServer()
  }, [isSignedIn, syncFromServer])
}
