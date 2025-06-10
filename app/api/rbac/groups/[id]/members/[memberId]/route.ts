import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0'

async function getAccessToken(session: any) {
  return session?.accessToken
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
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

    const groupId = params.id
    const memberId = params.memberId

    // Remove member from the group
    const response = await fetch(`${GRAPH_API_BASE}/groups/${groupId}/members/${memberId}/$ref`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Failed to remove member from group:', error)
      return NextResponse.json({ error: 'Failed to remove member' }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing member from group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}