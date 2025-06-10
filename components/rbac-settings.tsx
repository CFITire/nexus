"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { IconPlus, IconEdit, IconTrash, IconUsers } from "@tabler/icons-react"

interface ADGroup {
  id: string
  displayName: string
  description?: string
  memberCount: number
  members: ADUser[]
  roles: string[]
}

interface ADUser {
  id: string
  displayName: string
  userPrincipalName: string
  jobTitle?: string
}

interface Module {
  id: string
  name: string
  description: string
  enabled: boolean
}

const AVAILABLE_MODULES: Module[] = [
  { id: "dashboard", name: "Dashboard", description: "Access to main dashboard", enabled: true },
  { id: "inspections", name: "Inspections", description: "Access to inspection forms", enabled: true },
  { id: "lifecycle", name: "Lifecycle", description: "Access to lifecycle management", enabled: true },
  { id: "team", name: "Team", description: "Access to team management", enabled: true },
  { id: "vault", name: "Vault", description: "Access to password vault", enabled: true },
  { id: "settings", name: "Settings", description: "Access to application settings", enabled: true },
]

export function RbacSettings() {
  const [groups, setGroups] = useState<ADGroup[]>([])
  const [users, setUsers] = useState<ADUser[]>([])
  const [loading, setLoading] = useState(false)
  const [searchingUsers, setSearchingUsers] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<ADGroup | null>(null)
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isEditRolesOpen, setIsEditRolesOpen] = useState(false)

  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupDescription, setNewGroupDescription] = useState("")
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [userSearchQuery, setUserSearchQuery] = useState("")

  useEffect(() => {
    fetchGroups()
  }, [])

  useEffect(() => {
    const searchUsers = async () => {
      if (userSearchQuery.trim().length < 2) {
        setUsers([])
        return
      }

      setSearchingUsers(true)
      try {
        const response = await fetch(`/api/rbac/users?search=${encodeURIComponent(userSearchQuery)}`)
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
        }
      } catch (error) {
        console.error('Failed to search users:', error)
      } finally {
        setSearchingUsers(false)
      }
    }

    const debounceTimer = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounceTimer)
  }, [userSearchQuery])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/rbac/groups')
      if (response.ok) {
        const data = await response.json()
        setGroups(data)
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error)
    } finally {
      setLoading(false)
    }
  }


  const createGroup = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/rbac/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: newGroupName,
          description: newGroupDescription,
          modules: selectedModules
        })
      })
      
      if (response.ok) {
        await fetchGroups()
        setIsCreateGroupOpen(false)
        setNewGroupName("")
        setNewGroupDescription("")
        setSelectedModules([])
      }
    } catch (error) {
      console.error('Failed to create group:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteGroup = async (groupId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/rbac/groups/${groupId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchGroups()
      }
    } catch (error) {
      console.error('Failed to delete group:', error)
    } finally {
      setLoading(false)
    }
  }

  const addMembersToGroup = async () => {
    if (!selectedGroup) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/rbac/groups/${selectedGroup.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUsers })
      })
      
      if (response.ok) {
        await fetchGroups()
        setIsAddMemberOpen(false)
        setSelectedUsers([])
        setUserSearchQuery("")
      }
    } catch (error) {
      console.error('Failed to add members:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeMemberFromGroup = async (groupId: string, userId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/rbac/groups/${groupId}/members/${userId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchGroups()
      }
    } catch (error) {
      console.error('Failed to remove member:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateGroupRoles = async () => {
    if (!selectedGroup) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/rbac/groups/${selectedGroup.id}/roles`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: selectedModules })
      })
      
      if (response.ok) {
        await fetchGroups()
        setIsEditRolesOpen(false)
        setSelectedModules([])
      }
    } catch (error) {
      console.error('Failed to update group roles:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Role-Based Access Control</CardTitle>
          <CardDescription>
            Manage user groups and permissions for different modules in your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium">Active Directory Groups</h3>
            <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
              <DialogTrigger asChild>
                <Button>
                  <IconPlus className="mr-2 h-4 w-4" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                  <DialogDescription>
                    Create a new Active Directory group for role-based access control.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="group-name">Group Name</Label>
                    <Input
                      id="group-name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="e.g., Nexus-Inspectors"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="group-description">Description</Label>
                    <Input
                      id="group-description"
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      placeholder="Group description"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Module Access</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {AVAILABLE_MODULES.map((module) => (
                        <div key={module.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={module.id}
                            checked={selectedModules.includes(module.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedModules([...selectedModules, module.id])
                              } else {
                                setSelectedModules(selectedModules.filter(id => id !== module.id))
                              }
                            }}
                          />
                          <Label htmlFor={module.id} className="text-sm">
                            {module.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateGroupOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createGroup} disabled={loading || !newGroupName.trim()}>
                    Create Group
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {groups.map((group) => (
              <Card key={group.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{group.displayName}</CardTitle>
                      {group.description && (
                        <CardDescription>{group.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        <IconUsers className="mr-1 h-3 w-3" />
                        {group.memberCount} members
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSelectedGroup(group)
                          setSelectedModules(group.roles || [])
                          setIsEditRolesOpen(true)
                        }}
                      >
                        <IconEdit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteGroup(group.id)}>
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium mb-2">Assigned Roles</h5>
                      <div className="flex flex-wrap gap-2">
                        {group.roles?.length > 0 ? (
                          group.roles.map((role) => (
                            <Badge key={role} variant="default">
                              {AVAILABLE_MODULES.find(m => m.id === role)?.name || role}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline">No roles assigned</Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium mb-2">Members</h5>
                      <div className="flex flex-wrap gap-2">
                        {group.members.map((member) => (
                          <Badge key={member.id} variant="outline" className="flex items-center gap-1">
                            {member.displayName}
                            <button
                              onClick={() => removeMemberFromGroup(group.id, member.id)}
                              className="ml-1 text-destructive hover:text-destructive/80"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                        <Dialog open={isAddMemberOpen && selectedGroup?.id === group.id} onOpenChange={(open) => {
                          setIsAddMemberOpen(open)
                          if (open) setSelectedGroup(group)
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <IconPlus className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Members to {group.displayName}</DialogTitle>
                              <DialogDescription>
                                Select users from Active Directory to add to this group.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="user-search">Search Users</Label>
                                <Input
                                  id="user-search"
                                  placeholder="Search by name or email..."
                                  value={userSearchQuery}
                                  onChange={(e) => setUserSearchQuery(e.target.value)}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label>Select Users</Label>
                                <div className="max-h-48 overflow-y-auto space-y-2">
                                  {searchingUsers ? (
                                    <div className="text-sm text-muted-foreground text-center py-4">
                                      Searching users...
                                    </div>
                                  ) : userSearchQuery.length < 2 ? (
                                    <div className="text-sm text-muted-foreground text-center py-4">
                                      Enter at least 2 characters to search for users
                                    </div>
                                  ) : users.length === 0 ? (
                                    <div className="text-sm text-muted-foreground text-center py-4">
                                      No users found matching your search
                                    </div>
                                  ) : (
                                    users.filter(user => 
                                      !group.members.some(member => member.id === user.id)
                                    ).map((user) => (
                                    <div key={user.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={user.id}
                                        checked={selectedUsers.includes(user.id)}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            setSelectedUsers([...selectedUsers, user.id])
                                          } else {
                                            setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                                          }
                                        }}
                                      />
                                      <Label htmlFor={user.id} className="text-sm">
                                        <div>
                                          <div className="font-medium">{user.displayName}</div>
                                          <div className="text-xs text-muted-foreground">{user.userPrincipalName}</div>
                                        </div>
                                      </Label>
                                    </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => {
                                setIsAddMemberOpen(false)
                                setSelectedUsers([])
                                setUserSearchQuery("")
                              }}>
                                Cancel
                              </Button>
                              <Button onClick={addMembersToGroup} disabled={loading || selectedUsers.length === 0}>
                                Add Members
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Roles Dialog */}
      <Dialog open={isEditRolesOpen} onOpenChange={setIsEditRolesOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Roles for {selectedGroup?.displayName}</DialogTitle>
            <DialogDescription>
              Select which modules this group should have access to.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Module Access</Label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_MODULES.map((module) => (
                  <div key={module.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${module.id}`}
                      checked={selectedModules.includes(module.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedModules([...selectedModules, module.id])
                        } else {
                          setSelectedModules(selectedModules.filter(id => id !== module.id))
                        }
                      }}
                    />
                    <Label htmlFor={`edit-${module.id}`} className="text-sm">
                      {module.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditRolesOpen(false)
              setSelectedModules([])
            }}>
              Cancel
            </Button>
            <Button onClick={updateGroupRoles} disabled={loading}>
              Update Roles
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}