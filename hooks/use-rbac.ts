"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface UserPermissions {
  userId: string
  email: string
  displayName: string
  groups: string[]
  modules: string[]
  isSuperAdmin: boolean
}

export function useRBAC() {
  const { data: session, status } = useSession()
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPermissions() {
      if (status === 'loading') return
      
      if (!session) {
        setPermissions(null)
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/rbac/permissions')
        if (response.ok) {
          const data = await response.json()
          setPermissions(data)
        } else {
          setPermissions(null)
        }
      } catch (error) {
        console.error('Error fetching permissions:', error)
        setPermissions(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [session, status])

  const hasModuleAccess = (moduleId: string): boolean => {
    return permissions?.isSuperAdmin || permissions?.modules.includes(moduleId) || false
  }

  const hasGroupAccess = (groupName: string): boolean => {
    return permissions?.groups.includes(groupName) || false
  }

  const isAdmin = (): boolean => {
    return hasGroupAccess('Nexus-Administrators')
  }

  const isSuperAdmin = (): boolean => {
    return permissions?.isSuperAdmin || false
  }

  return {
    permissions,
    loading,
    hasModuleAccess,
    hasGroupAccess,
    isAdmin,
    isSuperAdmin
  }
}