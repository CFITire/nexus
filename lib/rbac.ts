import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0'

export interface UserPermissions {
  userId: string
  email: string
  displayName: string
  groups: string[]
  modules: string[]
  isSuperAdmin: boolean
}

export async function getUserPermissions(): Promise<UserPermissions | null> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !session.accessToken) {
      return null
    }

    // In development, provide fallback permissions
    if (process.env.NODE_ENV === 'development') {
      // Check for default development permissions
      console.log('🔧 Development mode: Using fallback permissions')
      return {
        userId: session.user.email,
        email: session.user.email,
        displayName: session.user.name || '',
        groups: ['Nexus-SuperAdministrators'],
        modules: ['dashboard', 'inspections', 'lifecycle', 'team', 'vault', 'settings', 'analytics', 'shipments', 'crm', 'communications'],
        isSuperAdmin: true
      }
    }

    // Get user's groups from Azure AD (including vault group)
    const response = await fetch(
      `${GRAPH_API_BASE}/me/memberOf?$select=id,displayName`,
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error('Failed to fetch user groups:', await response.text())
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        return {
          userId: session.user.email,
          email: session.user.email,
          displayName: session.user.name || '',
          groups: ['Nexus-Users'],
          modules: ['dashboard', 'inspections', 'vault'],
          isSuperAdmin: false
        }
      }
      return null
    }

    const data = await response.json()
    const azureGroups = data.value
    const groups = azureGroups.map((group: any) => group.displayName)
    
    // Filter for Nexus groups
    const nexusGroups = groups.filter((group: string) => group.startsWith('Nexus-'))
    
    // Check if user is super admin
    const isSuperAdmin = nexusGroups.includes('Nexus-SuperAdministrators')

    // Get modules from database based on group memberships
    let storedGroups = []
    try {
      storedGroups = await prisma.group.findMany({
        where: {
          azureId: {
            in: azureGroups.map((group: any) => group.id)
          }
        },
        include: {
          roles: {
            include: {
              role: true
            }
          }
        }
      })
    } catch (dbError) {
      console.error('Database error fetching groups:', dbError)
      // Fallback permissions in case of DB issues
      if (isSuperAdmin || process.env.NODE_ENV === 'development') {
        return {
          userId: session.user.email,
          email: session.user.email,
          displayName: session.user.name || '',
          groups: nexusGroups,
          modules: ['dashboard', 'inspections', 'lifecycle', 'team', 'vault', 'settings', 'analytics', 'shipments', 'crm', 'communications'],
          isSuperAdmin: true
        }
      }
      return {
        userId: session.user.email,
        email: session.user.email,
        displayName: session.user.name || '',
        groups: nexusGroups,
        modules: ['dashboard'],
        isSuperAdmin: false
      }
    }

    let modules = storedGroups.reduce((acc: string[], group: { roles: { role: { name: string } }[] }) => {
      const groupModules = group.roles.map((gr: { role: { name: string } }) => gr.role.name)
      return [...new Set([...acc, ...groupModules])]
    }, [])

    // Super admins get access to all modules
    if (isSuperAdmin) {
      try {
        const allRoles = await prisma.role.findMany({
          select: { name: true }
        })
        modules = allRoles.map((role: { name: string }) => role.name)
      } catch (dbError) {
        console.error('Database error fetching roles:', dbError)
        // Fallback to all modules for super admins
        modules = ['dashboard', 'inspections', 'lifecycle', 'team', 'vault', 'settings', 'analytics', 'shipments', 'crm', 'communications']
      }
    }

    return {
      userId: session.user.email,
      email: session.user.email,
      displayName: session.user.name || '',
      groups: nexusGroups,
      modules,
      isSuperAdmin
    }
  } catch (error) {
    console.error('Error getting user permissions:', error)
    // Final fallback for any authentication errors
    const session = await getServerSession(authOptions)
    if (session?.user?.email && process.env.NODE_ENV === 'development') {
      return {
        userId: session.user.email,
        email: session.user.email,
        displayName: session.user.name || '',
        groups: ['Nexus-Users'],
        modules: ['dashboard', 'inspections', 'vault'],
        isSuperAdmin: false
      }
    }
    return null
  }
}

export async function hasModuleAccess(moduleId: string | string[]): Promise<boolean> {
  try {
    const permissions = await getUserPermissions()
    
    // In development, allow access if we have any permissions object
    if (process.env.NODE_ENV === 'development' && permissions) {
      return true
    }
    
    if (permissions?.isSuperAdmin) return true
    
    if (Array.isArray(moduleId)) {
      return moduleId.some(module => permissions?.modules.includes(module)) || false
    } else {
      return permissions?.modules.includes(moduleId) || false
    }
  } catch (error) {
    console.error('Error checking module access:', error)
    // In development, be permissive for access issues
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Allowing access due to error')
      return true
    }
    return false
  }
}

export async function requireModuleAccess(moduleId: string | string[]) {
  const hasAccess = await hasModuleAccess(moduleId)
  
  if (!hasAccess) {
    const modules = Array.isArray(moduleId) ? moduleId.join(', ') : moduleId
    
    // In development, be more informative but still allow access
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ Access would be denied for module(s): ${modules} in production`)
      return true
    }
    
    throw new Error(`Access denied for module(s): ${modules}`)
  }
  
  return true
}

export function withRBAC(moduleId: string) {
  return async function rbacMiddleware(handler: Function) {
    return async function (request: any, context?: any) {
      try {
        await requireModuleAccess(moduleId)
        return handler(request, context)
      } catch (error) {
        return Response.json(
          { error: 'Access denied' }, 
          { status: 403 }
        )
      }
    }
  }
}