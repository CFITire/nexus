"use client"

import { useState, useEffect } from "react"
import { IconTrash, IconFolder, IconLock, IconEye, IconEdit, IconShare, IconSearch, IconLoader, IconPlus } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VaultFolder, SharedUser } from "@/lib/types/vault"
import { toast } from "sonner"

interface ADUser {
  id: string
  displayName: string
  userPrincipalName: string
  jobTitle?: string
}

interface ShareFolderDialogProps {
  folder: VaultFolder
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (folder: VaultFolder) => void
}

// API Functions
async function searchADUsers(query: string): Promise<ADUser[]> {
  const params = new URLSearchParams({ search: query })
  const response = await fetch(`/api/rbac/users?${params}`)
  if (!response.ok) {
    throw new Error('Failed to search users')
  }
  return response.json()
}

const permissionTemplates = [
  {
    name: "View Only",
    description: "Can view passwords but not edit or share",
    permissions: { view: true, edit: false, share: false, addPasswords: false }
  },
  {
    name: "Editor",
    description: "Can view, edit and add passwords but not share",
    permissions: { view: true, edit: true, share: false, addPasswords: true }
  },
  {
    name: "Full Access",
    description: "Can view, edit, add and share passwords",
    permissions: { view: true, edit: true, share: true, addPasswords: true }
  }
]

export function ShareFolderDialog({ folder, open, onOpenChange, onUpdate }: ShareFolderDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>(folder.sharedWith)
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [searchResults, setSearchResults] = useState<ADUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setSharedUsers(folder.sharedWith)
    setSearchQuery("")
    setSearchResults([])
  }, [folder.sharedWith, open])

  // Debounced search for AD users
  useEffect(() => {
    if (searchDebounce) {
      clearTimeout(searchDebounce)
    }

    if (searchQuery.length >= 2) {
      const timeout = setTimeout(async () => {
        try {
          setIsSearching(true)
          const results = await searchADUsers(searchQuery)
          setSearchResults(results)
        } catch (error) {
          console.error('Failed to search users:', error)
          toast.error('Failed to search users')
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      }, 300)
      setSearchDebounce(timeout)
    } else {
      setSearchResults([])
      setIsSearching(false)
    }

    return () => {
      if (searchDebounce) {
        clearTimeout(searchDebounce)
      }
    }
  }, [searchQuery])

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const isUserAlreadyShared = (userPrincipalName: string) => {
    return sharedUsers.some(user => user.userEmail === userPrincipalName)
  }

  const addTeamMember = (member: ADUser, template: typeof permissionTemplates[0]) => {
    if (isUserAlreadyShared(member.userPrincipalName)) return

    const newUser: SharedUser = {
      userId: member.id,
      userName: member.displayName,
      userEmail: member.userPrincipalName,
      permissions: [
        { type: 'view', granted: template.permissions.view },
        { type: 'edit', granted: template.permissions.edit },
        { type: 'share', granted: template.permissions.share },
        { type: 'addPasswords', granted: template.permissions.addPasswords }
      ],
      sharedAt: new Date(),
      sharedBy: "current.user@cfi.com" // TODO: Get actual current user
    }

    setSharedUsers([...sharedUsers, newUser])
    setSearchQuery("") // Clear search after adding
    setSearchResults([])
    toast.success(`${member.displayName} has been added to the folder`)
  }

  const removeUser = (userId: string) => {
    setSharedUsers(sharedUsers.filter(user => user.userId !== userId))
  }

  const updatePermission = (userId: string, permissionType: 'view' | 'edit' | 'share' | 'addPasswords', granted: boolean) => {
    setSharedUsers(sharedUsers.map(user => {
      if (user.userId === userId) {
        return {
          ...user,
          permissions: user.permissions.map(permission =>
            permission.type === permissionType
              ? { ...permission, granted }
              : permission
          )
        }
      }
      return user
    }))
  }

  const applyPermissionTemplate = (userId: string, template: typeof permissionTemplates[0]) => {
    setSharedUsers(sharedUsers.map(user => {
      if (user.userId === userId) {
        return {
          ...user,
          permissions: [
            { type: 'view', granted: template.permissions.view },
            { type: 'edit', granted: template.permissions.edit },
            { type: 'share', granted: template.permissions.share },
            { type: 'addPasswords', granted: template.permissions.addPasswords }
          ]
        }
      }
      return user
    }))
  }

  const handleSave = async () => {
    try {
      // Call the sharing API
      const response = await fetch(`/api/vault/folders/${folder.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sharedWith: sharedUsers })
      })

      if (!response.ok) {
        throw new Error('Failed to save sharing changes')
      }

      const updatedFolder: VaultFolder = {
        ...folder,
        isShared: sharedUsers.length > 0,
        sharedWith: sharedUsers,
        updatedAt: new Date()
      }

      onUpdate(updatedFolder)
      onOpenChange(false)
      toast.success('Folder sharing updated successfully')
    } catch (error) {
      console.error('Failed to save sharing changes:', error)
      toast.error('Failed to save sharing changes')
    }
  }

  const departments = Array.from(new Set(searchResults.map(m => m.jobTitle).filter(Boolean)))
  
  const filteredMembers = searchResults.filter(member => {
    const matchesDepartment = selectedDepartment === "all" || member.jobTitle === selectedDepartment
    const notAlreadyShared = !isUserAlreadyShared(member.userPrincipalName)
    
    return matchesDepartment && notAlreadyShared
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className="p-1.5 rounded-md"
              style={{ backgroundColor: `${folder.color}20` }}
            >
              <IconFolder className="h-4 w-4" style={{ color: folder.color }} />
            </div>
            Share "{folder.name}" Folder
          </DialogTitle>
          <DialogDescription>
            Search and add team members from Active Directory. Manage permissions to control who can view, edit, or share passwords in this folder.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Add Team Members */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Search Active Directory</Label>
              <Badge variant="secondary">{sharedUsers.length} shared</Badge>
            </div>
            
            <div className="space-y-3">
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email (min 2 characters)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {isSearching && (
                  <IconLoader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              
              {searchResults.length > 0 && departments.length > 0 && (
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by job title..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Job Titles</SelectItem>
                    {departments.filter((dept): dept is string => Boolean(dept)).map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Search Results */}
            {searchQuery.length >= 2 && (
              <div className="space-y-2">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <IconLoader className="h-5 w-5 animate-spin mr-2" />
                    Searching Active Directory...
                  </div>
                ) : filteredMembers.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg">
                    <div className="p-3 bg-muted/50 border-b text-sm font-medium">
                      Found {filteredMembers.length} user{filteredMembers.length !== 1 ? 's' : ''}
                    </div>
                    {filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 hover:bg-muted/50 border-b last:border-b-0"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-9 w-9 flex-shrink-0">
                            <AvatarFallback className="text-xs">
                              {getInitials(member.displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{member.displayName}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="truncate">{member.userPrincipalName}</span>
                              {member.jobTitle && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{member.jobTitle}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0 ml-2">
                          {permissionTemplates.map((template) => (
                            <Button
                              key={template.name}
                              variant="outline"
                              size="sm"
                              onClick={() => addTeamMember(member, template)}
                              className="text-xs whitespace-nowrap"
                              title={template.description}
                            >
                              {template.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.length >= 2 && !isSearching ? (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                    <IconSearch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No users found matching "{searchQuery}"</p>
                    <p className="text-sm">Try a different search term</p>
                  </div>
                ) : null}
              </div>
            )}

            {searchQuery.length > 0 && searchQuery.length < 2 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Type at least 2 characters to search
              </div>
            )}
          </div>

          <Separator />

          {/* Current Shared Users */}
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Folder Access ({sharedUsers.length})
            </Label>
            
            {sharedUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <IconLock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>This folder is private</p>
                <p className="text-sm">Add team members above to start sharing</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sharedUsers.map((user) => (
                  <div key={user.userId} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="text-sm">
                            {getInitials(user.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.userName}</p>
                          <p className="text-sm text-muted-foreground">{user.userEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={permissionTemplates.find(t => 
                            t.permissions.view === user.permissions.find(p => p.type === 'view')?.granted &&
                            t.permissions.edit === user.permissions.find(p => p.type === 'edit')?.granted &&
                            t.permissions.share === user.permissions.find(p => p.type === 'share')?.granted &&
                            t.permissions.addPasswords === user.permissions.find(p => p.type === 'addPasswords')?.granted
                          )?.name || "custom"}
                          onValueChange={(value) => {
                            const template = permissionTemplates.find(t => t.name === value)
                            if (template) {
                              applyPermissionTemplate(user.userId, template)
                            }
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {permissionTemplates.map((template) => (
                              <SelectItem key={template.name} value={template.name}>
                                {template.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-destructive"
                          onClick={() => removeUser(user.userId)}
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Permissions</Label>
                      <div className="grid grid-cols-3 gap-4">
                        {user.permissions.map((permission) => (
                          <div key={permission.type} className="flex items-center space-x-3">
                            <Checkbox
                              id={`${user.userId}-${permission.type}`}
                              checked={permission.granted}
                              onCheckedChange={(checked) =>
                                updatePermission(user.userId, permission.type, checked as boolean)
                              }
                            />
                            <div>
                              <Label
                                htmlFor={`${user.userId}-${permission.type}`}
                                className="text-sm font-medium flex items-center gap-2"
                              >
                                {permission.type === 'view' && <IconEye className="h-3 w-3" />}
                                {permission.type === 'edit' && <IconEdit className="h-3 w-3" />}
                                {permission.type === 'share' && <IconShare className="h-3 w-3" />}
                                {permission.type === 'addPasswords' && <IconPlus className="h-3 w-3" />}
                                {permission.type === 'addPasswords' ? 'Add Passwords' : permission.type.charAt(0).toUpperCase() + permission.type.slice(1)}
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                {permission.type === 'view' && 'Can view passwords in this folder'}
                                {permission.type === 'edit' && 'Can edit existing passwords'}
                                {permission.type === 'share' && 'Can share passwords with others'}
                                {permission.type === 'addPasswords' && 'Can create new passwords in this folder'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Shared on {(() => {
                        if (!user.sharedAt) return 'Unknown'
                        const date = typeof user.sharedAt === 'string' ? new Date(user.sharedAt) : user.sharedAt
                        if (isNaN(date.getTime())) return 'Invalid date'
                        return new Intl.DateTimeFormat('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }).format(date)
                      })()} by {user.sharedBy}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}