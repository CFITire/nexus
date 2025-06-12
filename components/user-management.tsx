"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { IconSearch, IconUserCheck, IconUsers, IconBuilding, IconPhone, IconMail, IconUserX } from "@tabler/icons-react"
import { toast } from "sonner"
import { useRBAC } from "@/hooks/use-rbac"

interface AzureUser {
  id: string
  displayName: string
  userPrincipalName: string
  jobTitle?: string
}

interface ImpersonationSession {
  id: string
  targetUser: {
    id: string
    name: string
    email: string
  }
  startedAt: string
}

export function UserManagement() {
  const { hasPermission } = useRBAC()
  const [users, setUsers] = useState<AzureUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AzureUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [currentImpersonation, setCurrentImpersonation] = useState<ImpersonationSession | null>(null)
  const [impersonationLoading, setImpersonationLoading] = useState<string | null>(null)

  const canImpersonate = hasPermission('admin', 'impersonate')

  useEffect(() => {
    if (canImpersonate) {
      checkImpersonationStatus()
      loadInitialUsers()
    }
  }, [canImpersonate])

  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      searchUsers()
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  const checkImpersonationStatus = async () => {
    try {
      const response = await fetch('/api/admin/impersonate')
      if (response.ok) {
        const data = await response.json()
        if (data.isImpersonating) {
          setCurrentImpersonation(data.impersonation)
        }
      }
    } catch (error) {
      console.error('Failed to check impersonation status:', error)
    }
  }

  const loadInitialUsers = async () => {
    setIsLoading(true)
    try {
      // Load a basic set of users (you can adjust this search term)
      const response = await fetch('/api/rbac/users?search=@')
      if (response.ok) {
        const data = await response.json()
        setUsers(data || [])
        setFilteredUsers(data || [])
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const searchUsers = async () => {
    if (searchTerm.trim().length < 2) return

    setIsSearching(true)
    try {
      const response = await fetch(`/api/rbac/users?search=${encodeURIComponent(searchTerm)}`)
      if (response.ok) {
        const data = await response.json()
        setFilteredUsers(data || [])
      }
    } catch (error) {
      console.error('Failed to search users:', error)
      toast.error('Failed to search users')
    } finally {
      setIsSearching(false)
    }
  }

  const startImpersonation = async (userEmail: string, userName: string) => {
    setImpersonationLoading(userEmail)
    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserEmail: userEmail
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Create impersonation URL with session token
        const impersonationUrl = `${window.location.origin}?impersonation=${data.impersonationId}`
        
        // Open in new window
        const newWindow = window.open(
          impersonationUrl, 
          `impersonate-${userEmail}`,
          'width=1200,height=800,scrollbars=yes,resizable=yes'
        )
        
        if (newWindow) {
          toast.success(`Opened impersonation window for ${userName}`)
          // Update current impersonation state
          setCurrentImpersonation({
            id: data.impersonationId,
            targetUser: data.targetUser,
            startedAt: new Date().toISOString()
          })
        } else {
          toast.error('Failed to open new window - check popup blocker')
        }
      } else {
        toast.error(data.error || 'Failed to start impersonation')
      }
    } catch (error) {
      console.error('Impersonation error:', error)
      toast.error('Failed to start impersonation')
    } finally {
      setImpersonationLoading(null)
    }
  }

  const endImpersonation = async () => {
    if (!currentImpersonation) return

    setImpersonationLoading('ending')
    try {
      const response = await fetch(`/api/admin/impersonate?id=${currentImpersonation.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Impersonation ended')
        window.location.reload()
      } else {
        toast.error('Failed to end impersonation')
      }
    } catch (error) {
      console.error('End impersonation error:', error)
      toast.error('Failed to end impersonation')
    } finally {
      setImpersonationLoading(null)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!canImpersonate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUsers className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Administrative user management and impersonation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <IconUsers className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Insufficient Permissions</p>
            <p className="text-sm">You need admin permissions to manage users</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconUsers className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>
          Search Active Directory users and manage impersonation sessions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Impersonation Sessions */}
        {currentImpersonation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <IconUsers className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">
                    Active impersonation: {currentImpersonation.targetUser.name}
                  </p>
                  <p className="text-sm text-blue-700">
                    {currentImpersonation.targetUser.email} • Opened in separate window
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={endImpersonation}
                disabled={impersonationLoading === 'ending'}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <IconUserX className="h-4 w-4 mr-1" />
                End Session
              </Button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="space-y-2">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Active Directory users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {isSearching && (
            <p className="text-sm text-muted-foreground">Searching Active Directory...</p>
          )}
        </div>

        {/* User List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <IconUsers className="h-8 w-8 mx-auto mb-2 opacity-50 animate-pulse" />
              <p>Loading users...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="grid gap-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{user.displayName}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <IconMail className="h-3 w-3" />
                          {user.userPrincipalName}
                        </div>
                        {user.jobTitle && (
                          <div className="flex items-center gap-1">
                            <IconBuilding className="h-3 w-3" />
                            {user.jobTitle}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Azure AD
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => startImpersonation(user.userPrincipalName, user.displayName)}
                      disabled={
                        impersonationLoading === user.userPrincipalName ||
                        !!currentImpersonation ||
                        impersonationLoading === 'ending'
                      }
                    >
                      {impersonationLoading === user.userPrincipalName ? (
                        <>
                          <IconUserCheck className="h-4 w-4 mr-1 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <IconUserCheck className="h-4 w-4 mr-1" />
                          Impersonate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm.length >= 2 ? (
            <div className="text-center py-8 text-muted-foreground">
              <IconUsers className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No users found matching "{searchTerm}"</p>
              <p className="text-xs">Try a different search term</p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <IconSearch className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Search for users to get started</p>
              <p className="text-xs">Type at least 2 characters to search Active Directory</p>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <IconUsers className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">User Impersonation</p>
              <ul className="text-blue-700 mt-1 space-y-1 text-xs">
                <li>• Search for any user in your Active Directory</li>
                <li>• Click "Impersonate" to view the system as that user</li>
                <li>• All impersonation sessions are logged for security</li>
                <li>• You can only impersonate one user at a time</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}