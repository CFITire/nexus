import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface GraphUser {
  id: string
  displayName: string
  jobTitle?: string
  mail?: string
  userPrincipalName: string
  department?: string
  officeLocation?: string
  businessPhones: string[]
  mobilePhone?: string
}

interface GraphDirectReport {
  id: string
  displayName: string
  jobTitle?: string
  mail?: string
  department?: string
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !(session as any).accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const accessToken = (session as any).accessToken

    // Fetch users from Microsoft Graph
    const usersResponse = await fetch(
      'https://graph.microsoft.com/v1.0/users?$select=id,displayName,jobTitle,mail,userPrincipalName,department,officeLocation,businessPhones,mobilePhone&$top=100',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!usersResponse.ok) {
      const errorText = await usersResponse.text()
      console.error('Graph API error details:', {
        status: usersResponse.status,
        statusText: usersResponse.statusText,
        headers: Object.fromEntries(usersResponse.headers.entries()),
        body: errorText
      })
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch users from Microsoft Graph',
          details: errorText,
          status: usersResponse.status 
        },
        { status: usersResponse.status }
      )
    }

    const usersData = await usersResponse.json()
    const users: GraphUser[] = usersData.value || []

    // Build organizational structure by fetching manager relationships
    const orgStructure = await buildOrgStructure(users, accessToken)

    return NextResponse.json({
      users,
      orgStructure,
      totalUsers: users.length
    })

  } catch (error) {
    console.error('Error fetching team data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch team data', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

async function buildOrgStructure(users: GraphUser[], accessToken: string) {
  const orgChart: any = {}
  const processedUsers = new Set<string>()

  // First pass: Get manager relationships for each user
  for (const user of users) {
    if (processedUsers.has(user.id)) continue

    try {
      // Fetch manager information
      const managerResponse = await fetch(
        `https://graph.microsoft.com/v1.0/users/${user.id}/manager?$select=id,displayName,jobTitle`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      let manager = null
      if (managerResponse.ok) {
        manager = await managerResponse.json()
      }

      // Fetch direct reports
      const reportsResponse = await fetch(
        `https://graph.microsoft.com/v1.0/users/${user.id}/directReports?$select=id,displayName,jobTitle,mail,department`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      let directReports: GraphDirectReport[] = []
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        directReports = reportsData.value || []
      }

      orgChart[user.id] = {
        user,
        manager,
        directReports,
        level: 0 // Will be calculated later
      }

      processedUsers.add(user.id)

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))

    } catch (error) {
      console.error(`Error processing user ${user.displayName}:`, error)
      // Continue with next user
    }
  }

  // Calculate levels in the org chart
  calculateOrgLevels(orgChart)

  return orgChart
}

function calculateOrgLevels(orgChart: any) {
  // Find root users (users without managers or whose managers are not in the org)
  const roots: string[] = []
  
  Object.keys(orgChart).forEach(userId => {
    const userInfo = orgChart[userId]
    if (!userInfo.manager || !orgChart[userInfo.manager.id]) {
      roots.push(userId)
    }
  })

  // BFS to calculate levels
  const queue: Array<{ userId: string, level: number }> = roots.map(id => ({ userId: id, level: 0 }))
  
  while (queue.length > 0) {
    const { userId, level } = queue.shift()!
    
    if (orgChart[userId]) {
      orgChart[userId].level = level
      
      // Add direct reports to queue
      orgChart[userId].directReports.forEach((report: GraphDirectReport) => {
        if (orgChart[report.id]) {
          queue.push({ userId: report.id, level: level + 1 })
        }
      })
    }
  }
}