import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('Session debug info:', {
      hasSession: !!session,
      sessionKeys: session ? Object.keys(session) : [],
      hasAccessToken: !!(session as any)?.accessToken,
      tokenPreview: (session as any)?.accessToken ? `${(session as any).accessToken.substring(0, 10)}...` : 'none'
    })
    
    if (!session) {
      return NextResponse.json(
        { error: 'No session found - user not authenticated' },
        { status: 401 }
      )
    }

    if (!(session as any).accessToken) {
      return NextResponse.json(
        { error: 'No access token found in session - may need to re-login' },
        { status: 401 }
      )
    }

    const accessToken = (session as any).accessToken

    // Start with just the current user's profile (requires only User.Read)
    const meResponse = await fetch(
      'https://graph.microsoft.com/v1.0/me?$select=id,displayName,jobTitle,mail,userPrincipalName,department,officeLocation,businessPhones,mobilePhone',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!meResponse.ok) {
      const errorText = await meResponse.text()
      console.error('Graph API /me error:', {
        status: meResponse.status,
        statusText: meResponse.statusText,
        body: errorText
      })
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch user profile from Microsoft Graph',
          details: errorText,
          status: meResponse.status 
        },
        { status: meResponse.status }
      )
    }

    const userData = await meResponse.json()

    // Try to get manager information
    let manager = null
    try {
      const managerResponse = await fetch(
        'https://graph.microsoft.com/v1.0/me/manager?$select=id,displayName,jobTitle',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (managerResponse.ok) {
        manager = await managerResponse.json()
      }
    } catch (error) {
      console.warn('Could not fetch manager info:', error)
    }

    // Try to get direct reports
    let directReports = []
    try {
      const reportsResponse = await fetch(
        'https://graph.microsoft.com/v1.0/me/directReports?$select=id,displayName,jobTitle,mail,department',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        directReports = reportsData.value || []
      }
    } catch (error) {
      console.warn('Could not fetch direct reports:', error)
    }

    return NextResponse.json({
      user: userData,
      manager,
      directReports,
      permissions: {
        canReadAllUsers: false, // Will be true if we can fetch all users
        canReadDirectory: false
      }
    })

  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch user profile', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}