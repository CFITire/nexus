import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0'

async function getAccessToken(session: any) {
  return session?.accessToken
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accessToken = await getAccessToken(session)
    if (!accessToken) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const searchQuery = searchParams.get('search')

    if (!searchQuery || searchQuery.trim().length < 2) {
      return NextResponse.json([])
    }

    // Fetch all users and filter on the server side to avoid OData syntax issues
    const response = await fetch(
      `${GRAPH_API_BASE}/users?$select=id,displayName,userPrincipalName,jobTitle&$top=999`,
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
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: response.status })
    }

    const data = await response.json()
    
    // Filter users on the server side to match the search query
    const searchLower = searchQuery.toLowerCase()
    const filteredUsers = data.value.filter((user: any) => {
      const displayName = (user.displayName || '').toLowerCase()
      const userPrincipalName = (user.userPrincipalName || '').toLowerCase()
      
      return displayName.includes(searchLower) || userPrincipalName.includes(searchLower)
    })
    
    const users = filteredUsers.slice(0, 50).map((user: any) => ({
      id: user.id,
      displayName: user.displayName,
      userPrincipalName: user.userPrincipalName,
      jobTitle: user.jobTitle
    }))

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}