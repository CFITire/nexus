"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrgChart } from "@/components/org-chart"
import { TeamDirectory } from "@/components/team-directory"
import { IconHierarchy, IconUsers, IconRefresh } from "@tabler/icons-react"

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

interface OrgStructure {
  [userId: string]: {
    user: GraphUser
    manager?: any
    directReports: any[]
    level: number
  }
}

interface TeamData {
  users: GraphUser[]
  orgStructure: OrgStructure
  totalUsers: number
  limitedData?: boolean
}

export function TeamContent() {
  const [teamData, setTeamData] = useState<TeamData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTeamData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // First try to get full team data
      let response = await fetch('/api/team')
      
      if (!response.ok) {
        console.warn('Full team data not available, falling back to user profile only')
        
        // Fall back to just the current user's profile
        response = await fetch('/api/team/me')
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          throw new Error(errorData.error || `HTTP ${response.status}`)
        }

        const userData = await response.json()
        
        // Convert single user data to team data format
        setTeamData({
          users: [userData.user],
          orgStructure: {
            [userData.user.id]: {
              user: userData.user,
              manager: userData.manager,
              directReports: userData.directReports,
              level: 0
            }
          },
          totalUsers: 1,
          limitedData: true
        })
        
        return
      }

      const data = await response.json()
      setTeamData(data)
    } catch (error) {
      console.error('Error fetching team data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch team data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTeamData()
  }, [])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between px-4 lg:px-6">
            <div>
              <h1 className="text-2xl font-bold">Team Organization</h1>
              <p className="text-muted-foreground">
                View your organization structure and team directory
              </p>
              {teamData && (
                <div className="text-sm text-muted-foreground mt-1">
                  <p>{teamData.totalUsers} team member{teamData.totalUsers !== 1 ? 's' : ''}</p>
                  {teamData.limitedData && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Limited view: Showing your profile only. Additional permissions needed for full team data.
                    </p>
                  )}
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              onClick={fetchTeamData}
              disabled={isLoading}
            >
              <IconRefresh className={isLoading ? "animate-spin" : ""} />
              Refresh
            </Button>
          </div>

          {error && (
            <div className="mx-4 lg:mx-6 p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-800 dark:text-red-200 text-sm">
                <strong>Error:</strong> {error}
              </p>
              <p className="text-red-600 dark:text-red-300 text-xs mt-1">
                This may be due to missing Azure AD permissions or authentication issues.
              </p>
              <details className="mt-2">
                <summary className="text-xs cursor-pointer text-red-600 dark:text-red-300">
                  Troubleshooting steps
                </summary>
                <div className="mt-1 text-xs text-red-600 dark:text-red-300 space-y-1">
                  <p>1. Try refreshing the page or signing out and back in</p>
                  <p>2. Check that your Azure AD app has the required permissions:</p>
                  <p className="ml-4">• User.Read (basic profile)</p>
                  <p className="ml-4">• User.Read.All (to see other users)</p>
                  <p>3. Ensure admin consent has been granted for your organization</p>
                  <p>4. Check browser console for detailed error messages</p>
                </div>
              </details>
            </div>
          )}

          <Tabs defaultValue="orgchart" className="w-full">
            <div className="px-4 lg:px-6">
              <TabsList>
                <TabsTrigger value="orgchart">
                  <IconHierarchy className="mr-2 size-4" />
                  Org Chart
                </TabsTrigger>
                <TabsTrigger value="directory">
                  <IconUsers className="mr-2 size-4" />
                  Team Directory
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="orgchart" className="mt-4">
              <OrgChart 
                orgStructure={teamData?.orgStructure || {}}
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="directory" className="mt-4">
              <TeamDirectory 
                users={teamData?.users || []}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}