import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0'

async function getAccessToken(session: any) {
  return session?.accessToken
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accessToken = await getAccessToken(session)
    if (!accessToken) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 })
    }

    const { userIds } = await request.json()
    const { id: groupId } = await params

    // Add members to the group
    const promises = userIds.map(async (userId: string) => {
      const response = await fetch(`${GRAPH_API_BASE}/groups/${groupId}/members/$ref`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          '@odata.id': `${GRAPH_API_BASE}/users/${userId}`
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error(`Failed to add user ${userId} to group:`, error)
        throw new Error(`Failed to add user ${userId}`)
      }

      return response
    })

    await Promise.all(promises)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding members to group:', error)
    return NextResponse.json({ error: 'Failed to add members' }, { status: 500 })
  }
}