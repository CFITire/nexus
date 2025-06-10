import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0'

async function getAccessToken(session: any) {
  return session?.accessToken
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accessToken = await getAccessToken(session)
    if (!accessToken) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 })
    }

    // Fetch groups with Nexus prefix (application-specific groups)
    const response = await fetch(
      `${GRAPH_API_BASE}/groups?$filter=startswith(displayName,'Nexus-')&$expand=members&$select=id,displayName,description,members`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Graph API error:', error)
      return NextResponse.json({ error: 'Failed to fetch groups' }, { status: response.status })
    }

    const data = await response.json()
    
    // Get stored groups and their roles from database
    const storedGroups = await prisma.group.findMany({
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    })

    const groups = await Promise.all(data.value.map(async (group: any) => {
      // Find stored group by Azure ID
      let storedGroup = storedGroups.find((sg: { azureId: string }) => sg.azureId === group.id)
      
      // If group doesn't exist in database, create it
      if (!storedGroup) {
        storedGroup = await prisma.group.create({
          data: {
            azureId: group.id,
            displayName: group.displayName,
            description: group.description || ''
          },
          include: {
            roles: {
              include: {
                role: true
              }
            }
          }
        })
      }

      return {
        id: group.id,
        displayName: group.displayName,
        description: group.description || '',
        memberCount: group.members?.length || 0,
        members: group.members?.map((member: any) => ({
          id: member.id,
          displayName: member.displayName,
          userPrincipalName: member.userPrincipalName,
          jobTitle: member.jobTitle
        })) || [],
        roles: storedGroup.roles.map((gr: { role: { name: string } }) => gr.role.name)
      }
    }))

    return NextResponse.json(groups)
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accessToken = await getAccessToken(session)
    if (!accessToken) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 })
    }

    const { displayName, description, modules } = await request.json()

    // Ensure group name has Nexus prefix
    const groupName = displayName.startsWith('Nexus-') ? displayName : `Nexus-${displayName}`

    // Create the group in Azure AD
    const createGroupResponse = await fetch(`${GRAPH_API_BASE}/groups`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        displayName: groupName,
        description: description || `Role-based access group for ${groupName}`,
        mailEnabled: false,
        mailNickname: groupName.toLowerCase().replace(/[^a-z0-9]/g, ''),
        securityEnabled: true,
        groupTypes: []
      }),
    })

    if (!createGroupResponse.ok) {
      const error = await createGroupResponse.text()
      console.error('Failed to create group:', error)
      return NextResponse.json({ error: 'Failed to create group' }, { status: createGroupResponse.status })
    }

    const newGroup = await createGroupResponse.json()

    // Store module permissions (you might want to store this in a database)
    // For now, we'll add this as a custom extension attribute or store separately
    
    return NextResponse.json({
      id: newGroup.id,
      displayName: newGroup.displayName,
      description: newGroup.description,
      memberCount: 0,
      members: [],
      modules: modules || []
    })
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}