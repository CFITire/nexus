"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { IconUserCheck, IconUserX, IconUsers, IconShield, IconClock, IconAlertTriangle } from "@tabler/icons-react"
import { toast } from "sonner"

interface AzureUser {
  id: string
  displayName: string
  userPrincipalName: string
  jobTitle?: string
}

interface User {
  id: string
  name: string
  email: string
  groups: {
    id: string
    displayName: string
    permissions: {
      module: string
      action: string
    }[]
  }[]
}

interface ImpersonationSession {
  id: string
  targetUser: User
  startedAt: string
}

export function UserImpersonation() {
  const [isOpen, setIsOpen] = useState(false)
  const [azureUsers, setAzureUsers] = useState<AzureUser[]>([])
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>("")
  const [reason, setReason] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [currentImpersonation, setCurrentImpersonation] = useState<ImpersonationSession | null>(null)
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Load users and check impersonation status
  useEffect(() => {
    checkImpersonationStatus()
  }, [])

  // Debounced search for Azure AD users
  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.trim().length < 2) {
        setAzureUsers([])
        return
      }

      setIsSearching(true)
      try {
        const response = await fetch(`/api/rbac/users?search=${encodeURIComponent(searchTerm)}`)
        if (response.ok) {
          const data = await response.json()
          setAzureUsers(data || [])
        } else {
          toast.error('Failed to search users')
        }
      } catch (error) {
        console.error('Failed to search users:', error)
        toast.error('Failed to search users')
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const checkImpersonationStatus = async () => {
    try {
      const response = await fetch('/api/admin/impersonate')
      if (response.ok) {
        const data = await response.json()
        setIsImpersonating(data.isImpersonating)
        setCurrentImpersonation(data.impersonation)
      }
    } catch (error) {
      console.error('Failed to check impersonation status:', error)
    }
  }

  const startImpersonation = async () => {
    if (!selectedUserEmail) {
      toast.error('Please select a user to impersonate')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserEmail: selectedUserEmail,
          reason: reason.trim() || undefined
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsImpersonating(true)
        setCurrentImpersonation({
          id: data.impersonationId,
          targetUser: data.targetUser,
          startedAt: new Date().toISOString()
        })
        setIsOpen(false)
        setSelectedUserEmail("")
        setSearchTerm("")
        setAzureUsers([])
        setReason("")
        toast.success(`Now impersonating ${data.targetUser.name}`)
        
        // Reload the page to apply impersonation
        window.location.reload()
      } else {
        toast.error(data.error || 'Failed to start impersonation')
      }
    } catch (error) {
      console.error('Impersonation error:', error)
      toast.error('Failed to start impersonation')
    } finally {
      setIsLoading(false)
    }
  }

  const endImpersonation = async () => {
    if (!currentImpersonation) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/impersonate?id=${currentImpersonation.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setIsImpersonating(false)
        setCurrentImpersonation(null)
        toast.success('Impersonation ended')
        
        // Reload the page to exit impersonation
        window.location.reload()
      } else {
        toast.error('Failed to end impersonation')
      }
    } catch (error) {
      console.error('End impersonation error:', error)
      toast.error('Failed to end impersonation')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedUser = azureUsers.find(user => user.userPrincipalName === selectedUserEmail)

  // Impersonation indicator banner
  if (isImpersonating && currentImpersonation) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white p-2 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconAlertTriangle className="h-5 w-5" />
            <span className="font-medium">
              Impersonating: {currentImpersonation.targetUser.name} ({currentImpersonation.targetUser.email})
            </span>
            <Badge className="bg-orange-600 text-white">
              Started: {new Date(currentImpersonation.startedAt).toLocaleTimeString()}
            </Badge>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={endImpersonation}
            disabled={isLoading}
            className="border-white text-white hover:bg-white hover:text-orange-500"
          >
            <IconUserX className="h-4 w-4 mr-1" />
            Exit Impersonation
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconUserCheck className="h-4 w-4 mr-2" />
          Impersonate User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconShield className="h-5 w-5" />
            User Impersonation
          </DialogTitle>
          <DialogDescription>
            Temporarily view the system as another user for support and testing purposes. All actions are logged.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Search */}
          <div>
            <Label htmlFor="user-search">Search Active Directory Users</Label>
            <Input
              id="user-search"
              placeholder="Search by name or email (minimum 2 characters)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isSearching && (
              <p className="text-xs text-muted-foreground mt-1">Searching Active Directory...</p>
            )}
          </div>

          {/* User Selection */}
          {azureUsers.length > 0 && (
            <div>
              <Label htmlFor="user-select">Select User to Impersonate</Label>
              <Select value={selectedUserEmail} onValueChange={setSelectedUserEmail}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {azureUsers.map((user) => (
                    <SelectItem key={user.id} value={user.userPrincipalName}>
                      <div className="flex items-center gap-2">
                        <IconUsers className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{user.displayName}</p>
                          <p className="text-xs text-muted-foreground">{user.userPrincipalName}</p>
                          {user.jobTitle && (
                            <p className="text-xs text-muted-foreground">{user.jobTitle}</p>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {searchTerm.length >= 2 && azureUsers.length === 0 && !isSearching && (
            <div className="text-center py-4 text-muted-foreground">
              <IconUsers className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No users found matching "{searchTerm}"</p>
            </div>
          )}

          {/* Selected User Details */}
          {selectedUser && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Selected Azure AD User</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{selectedUser.displayName}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.userPrincipalName}</p>
                  {selectedUser.jobTitle && (
                    <p className="text-sm text-muted-foreground">{selectedUser.jobTitle}</p>
                  )}
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="flex items-start gap-2">
                    <IconUsers className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-800">Active Directory User</p>
                      <p className="text-blue-700 mt-1">
                        Permissions will be inherited from their Azure AD group memberships and database assignments.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reason */}
          <div>
            <Label htmlFor="reason">Reason for Impersonation (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Testing user permissions, troubleshooting issue..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </div>

          {/* Warning */}
          <div className="bg-orange-50 border border-orange-200 rounded p-3">
            <div className="flex items-start gap-2">
              <IconAlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-orange-800">Important Notes:</p>
                <ul className="text-orange-700 mt-1 space-y-1">
                  <li>• All actions during impersonation are logged and audited</li>
                  <li>• You will see the system as the selected user sees it</li>
                  <li>• Use this feature responsibly and only for legitimate purposes</li>
                  <li>• End impersonation when finished</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={startImpersonation}
            disabled={!selectedUserEmail || isLoading}
          >
            {isLoading ? (
              <>
                <IconClock className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <IconUserCheck className="h-4 w-4 mr-2" />
                Start Impersonation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}