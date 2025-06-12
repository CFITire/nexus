"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface UserPermissions {
  userId: string
  email: string
  displayName: string
  groups: string[]
  modules: string[]
  permissions: {
    module: string
    action: string
  }[]
  isSuperAdmin: boolean
  isImpersonating?: boolean
  impersonatedUser?: {
    id: string
    name: string
    email: string
  }
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

  const hasPermission = (module: string, action: string): boolean => {
    if (permissions?.isSuperAdmin) return true
    return permissions?.permissions.some(p => p.module === module && p.action === action) || false
  }

  const isAdmin = (): boolean => {
    return hasGroupAccess('Nexus-Administrators')
  }

  const isSuperAdmin = (): boolean => {
    return permissions?.isSuperAdmin || false
  }

  const isImpersonating = (): boolean => {
    return permissions?.isImpersonating || false
  }

  return {
    permissions,
    loading,
    hasModuleAccess,
    hasGroupAccess,
    hasPermission,
    isAdmin,
    isSuperAdmin,
    isImpersonating
  }
}