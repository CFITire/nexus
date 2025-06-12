"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

interface ImpersonationContext {
  isImpersonating: boolean
  impersonatedUser: {
    id: string
    name: string
    email: string
  } | null
  impersonationId: string | null
  endImpersonation: () => void
}

export function useImpersonation(): ImpersonationContext {
  const searchParams = useSearchParams()
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [impersonatedUser, setImpersonatedUser] = useState<any>(null)
  const [impersonationId, setImpersonationId] = useState<string | null>(null)

  useEffect(() => {
    const impersonationParam = searchParams.get('impersonation')
    
    if (impersonationParam) {
      // Store impersonation session in localStorage for this window
      localStorage.setItem('impersonationSession', impersonationParam)
      
      // Remove the parameter from URL without refreshing
      const url = new URL(window.location.href)
      url.searchParams.delete('impersonation')
      window.history.replaceState({}, '', url.toString())
      
      // Load impersonation details
      loadImpersonationSession(impersonationParam)
    } else {
      // Check if we already have an impersonation session in localStorage
      const storedSession = localStorage.getItem('impersonationSession')
      if (storedSession) {
        loadImpersonationSession(storedSession)
      }
    }
  }, [searchParams])

  const loadImpersonationSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/admin/impersonate?session=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.isValid && data.targetUser) {
          setIsImpersonating(true)
          setImpersonatedUser(data.targetUser)
          setImpersonationId(sessionId)
          
          // Show notification only once when impersonation starts
          if (!localStorage.getItem('impersonationNotified')) {
            toast.success(`Impersonating ${data.targetUser.name}`, {
              duration: 5000
            })
            localStorage.setItem('impersonationNotified', 'true')
          }
        } else {
          // Invalid or expired session
          localStorage.removeItem('impersonationSession')
          localStorage.removeItem('impersonationNotified')
        }
      }
    } catch (error) {
      console.error('Failed to load impersonation session:', error)
      localStorage.removeItem('impersonationSession')
      localStorage.removeItem('impersonationNotified')
    }
  }

  const endImpersonation = () => {
    localStorage.removeItem('impersonationSession')
    localStorage.removeItem('impersonationNotified')
    setIsImpersonating(false)
    setImpersonatedUser(null)
    setImpersonationId(null)
    window.close() // Close the impersonation window
  }

  return {
    isImpersonating,
    impersonatedUser,
    impersonationId,
    endImpersonation
  }
}