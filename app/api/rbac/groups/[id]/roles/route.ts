import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accessToken = session?.accessToken
    if (!accessToken) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 })
    }

    const { id } = await params
    
    // Get group roles from database
    const group = await prisma.group.findUnique({
      where: { azureId: id },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const roles = group.roles.map((gr: { role: { name: string } }) => gr.role.name)

    return NextResponse.json({ roles })
  } catch (error) {
    console.error('Error fetching group roles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accessToken = session?.accessToken
    if (!accessToken) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 })
    }

    const { roles } = await request.json()
    const { id } = await params

    // Find or create group in database
    let group = await prisma.group.findUnique({
      where: { azureId: id }
    })

    if (!group) {
      // Get group info from Azure AD to create it
      const response = await fetch(
        `${GRAPH_API_BASE}/groups/${id}?$select=id,displayName,description`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 })
      }

      const azureGroup = await response.json()
      
      // Protect SuperAdministrators group from role editing
      if (azureGroup.displayName === 'Nexus-SuperAdministrators') {
        return NextResponse.json({ 
          error: 'Cannot edit SuperAdministrators group roles - this group automatically gets all permissions' 
        }, { status: 403 })
      }
      
      group = await prisma.group.create({
        data: {
          azureId: azureGroup.id,
          displayName: azureGroup.displayName,
          description: azureGroup.description || ''
        }
      })
    } else {
      // Check if existing group is SuperAdministrators
      if (group.displayName === 'Nexus-SuperAdministrators') {
        return NextResponse.json({ 
          error: 'Cannot edit SuperAdministrators group roles - this group automatically gets all permissions' 
        }, { status: 403 })
      }
    }

    // Get all roles
    const allRoles = await prisma.role.findMany()
    
    // Remove existing role assignments
    await prisma.groupRole.deleteMany({
      where: { groupId: group.id }
    })

    // Add new role assignments
    if (roles && roles.length > 0) {
      const roleRecords = allRoles.filter((role: { name: string }) => roles.includes(role.name))
      
      await prisma.groupRole.createMany({
        data: roleRecords.map((role: { id: string }) => ({
          groupId: group.id,
          roleId: role.id
        }))
      })
    }

    return NextResponse.json({ 
      groupId: id,
      groupName: group.displayName,
      roles: roles 
    })
  } catch (error) {
    console.error('Error updating group roles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}