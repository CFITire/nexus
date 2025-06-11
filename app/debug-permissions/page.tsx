'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Users, Database, Shield, AlertCircle } from 'lucide-react'

interface DebugData {
  user: {
    email: string
    name: string
    hasAccessToken: boolean
  }
  azureGroups: {
    total: number
    nexusGroups: Array<{
      id: string
      displayName: string
      description: string
    }>
    allGroups: Array<{
      id: string
      displayName: string
      description: string
    }>
  }
  database: {
    storedGroups: number
    storedRoles: number
    groups: Array<{
      id: string
      azureId: string
      displayName: string
      roles: string[]
    }>
    roles: Array<{
      id: string
      name: string
    }>
  }
  userPermissions: {
    userId: string
    email: string
    groups: string[]
    modules: string[]
    isSuperAdmin: boolean
  } | null
}

export default function DebugPermissionsPage() {
  const [data, setData] = useState<DebugData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDebugData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/debug-permissions')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch debug data')
      }
      const result = await response.json()
      setData(result.debug)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDebugData()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Permission Debug</h1>
          <p className="text-muted-foreground">
            Troubleshoot user groups and permissions
          </p>
        </div>
        <Button onClick={fetchDebugData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Error:</span>
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Current User
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">Email:</span> {data.user.email}
              </div>
              <div>
                <span className="font-medium">Name:</span> {data.user.name}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Access Token:</span>
                <Badge variant={data.user.hasAccessToken ? "default" : "destructive"}>
                  {data.user.hasAccessToken ? "Present" : "Missing"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* User Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Effective Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.userPermissions ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Super Admin:</span>
                    <Badge variant={data.userPermissions.isSuperAdmin ? "default" : "secondary"}>
                      {data.userPermissions.isSuperAdmin ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Groups:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {data.userPermissions.groups.length > 0 ? (
                        data.userPermissions.groups.map((group) => (
                          <Badge key={group} variant="outline" className="text-xs">
                            {group}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">No groups found</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Modules:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {data.userPermissions.modules.length > 0 ? (
                        data.userPermissions.modules.map((module) => (
                          <Badge key={module} variant="default" className="text-xs">
                            {module}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">No modules assigned</span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground">No permissions data available</div>
              )}
            </CardContent>
          </Card>

          {/* Azure AD Groups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Azure AD Groups
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">Total Groups:</span> {data.azureGroups.total}
              </div>
              <div>
                <span className="font-medium">Nexus Groups:</span> {data.azureGroups.nexusGroups.length}
              </div>
              <div>
                <span className="font-medium">All Groups:</span>
                <div className="max-h-32 overflow-y-auto mt-1 space-y-1">
                  {data.azureGroups.allGroups.map((group) => (
                    <div key={group.id} className="text-sm">
                      <Badge 
                        variant={group.displayName.startsWith('Nexus-') ? "default" : "secondary"}
                        className="text-xs mr-2"
                      >
                        {group.displayName}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">Stored Groups:</span> {data.database.storedGroups}
              </div>
              <div>
                <span className="font-medium">Available Roles:</span> {data.database.storedRoles}
              </div>
              <div>
                <span className="font-medium">Roles:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.database.roles.map((role) => (
                    <Badge key={role.id} variant="outline" className="text-xs">
                      {role.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-medium">Groups with Roles:</span>
                <div className="max-h-32 overflow-y-auto mt-1 space-y-2">
                  {data.database.groups.length > 0 ? (
                    data.database.groups.map((group) => (
                      <div key={group.id} className="text-sm">
                        <div className="font-medium">{group.displayName}</div>
                        <div className="flex flex-wrap gap-1">
                          {group.roles.map((role) => (
                            <Badge key={role} variant="default" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">No groups with roles assigned</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Troubleshooting Tips */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Troubleshooting Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><strong>1. No Azure Groups:</strong> Check if user is properly authenticated and has access token</div>
          <div><strong>2. Missing Nexus Groups:</strong> Create groups in Azure AD with "Nexus-" prefix</div>
          <div><strong>3. No Roles in Database:</strong> Run database seeding: <code className="bg-muted px-1 rounded">npm run db:seed</code></div>
          <div><strong>4. Groups Not Synced:</strong> Visit Settings → RBAC to sync Azure groups with database</div>
          <div><strong>5. No Module Access:</strong> Assign roles to groups in the RBAC settings</div>
        </CardContent>
      </Card>
    </div>
  )
}