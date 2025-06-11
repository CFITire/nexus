import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserPermissions } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0'

export async function GET() {
  try {
    console.log('=== Permission Debug ===')
    
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }

    const accessToken = session.accessToken
    if (!accessToken) {
      return NextResponse.json({ 
        error: 'No access token found',
        session: {
          hasUser: !!session.user,
          userEmail: session.user?.email,
          hasAccessToken: false
        }
      }, { status: 401 })
    }

    // 1. Check Azure AD groups directly
    console.log('Fetching Azure AD groups...')
    const azureGroupsResponse = await fetch(
      `${GRAPH_API_BASE}/me/memberOf?$select=id,displayName,description`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    let azureGroups = []
    if (azureGroupsResponse.ok) {
      const azureData = await azureGroupsResponse.json()
      azureGroups = azureData.value
      console.log('Azure groups found:', azureGroups.length)
    } else {
      console.error('Failed to fetch Azure groups:', await azureGroupsResponse.text())
    }

    // 2. Check database groups
    const dbGroups = await prisma.group.findMany({
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    })

    // 3. Check all roles in database
    const allRoles = await prisma.role.findMany()

    // 4. Get user permissions using the RBAC function
    const userPermissions = await getUserPermissions()

    return NextResponse.json({
      debug: {
        user: {
          email: session.user?.email,
          name: session.user?.name,
          hasAccessToken: !!accessToken
        },
        azureGroups: {
          total: azureGroups.length,
          nexusGroups: azureGroups.filter((g: any) => g.displayName.startsWith('Nexus-')),
          allGroups: azureGroups.map((g: any) => ({
            id: g.id,
            displayName: g.displayName,
            description: g.description
          }))
        },
        database: {
          storedGroups: dbGroups.length,
          storedRoles: allRoles.length,
          groups: dbGroups.map(g => ({
            id: g.id,
            azureId: g.azureId,
            displayName: g.displayName,
            roles: g.roles.map(gr => gr.role.name)
          })),
          roles: allRoles.map(r => ({ id: r.id, name: r.name }))
        },
        userPermissions: userPermissions ? {
          userId: userPermissions.userId,
          email: userPermissions.email,
          groups: userPermissions.groups,
          modules: userPermissions.modules,
          isSuperAdmin: userPermissions.isSuperAdmin
        } : null
      }
    })

  } catch (error) {
    console.error('Permission debug error:', error)
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}