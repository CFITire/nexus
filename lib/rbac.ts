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
    const storedGroups = await prisma.group.findMany({
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

    let modules = storedGroups.reduce((acc: string[], group: { roles: { role: { name: string } }[] }) => {
      const groupModules = group.roles.map((gr: { role: { name: string } }) => gr.role.name)
      return [...new Set([...acc, ...groupModules])]
    }, [])

    // Super admins get access to all modules
    if (isSuperAdmin) {
      const allRoles = await prisma.role.findMany({
        select: { name: true }
      })
      modules = allRoles.map((role: { name: string }) => role.name)
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
    return null
  }
}

export async function hasModuleAccess(moduleId: string): Promise<boolean> {
  try {
    const permissions = await getUserPermissions()
    return permissions?.isSuperAdmin || permissions?.modules.includes(moduleId) || false
  } catch (error) {
    console.error('Error checking module access:', error)
    return false
  }
}

export async function requireModuleAccess(moduleId: string) {
  const hasAccess = await hasModuleAccess(moduleId)
  
  if (!hasAccess) {
    throw new Error(`Access denied for module: ${moduleId}`)
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