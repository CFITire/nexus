"use client"

import { useSession } from 'next-auth/react'
import { useUserPermissions } from './use-rbac-queries'

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
  
  // Don't fetch permissions if not authenticated
  const shouldLoadPermissions = status !== 'loading' && !!session
  
  // Use TanStack Query for permissions
  const {
    data: permissions,
    isLoading: loading,
    error
  } = useUserPermissions({ 
    enabled: shouldLoadPermissions 
  })

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