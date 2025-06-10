"use client"

import { useState, useEffect } from "react"
import { IconTrash, IconFolder, IconLock, IconEye, IconEdit, IconShare } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VaultFolder, SharedUser, TeamMember } from "@/lib/types/vault"

interface ShareFolderDialogProps {
  folder: VaultFolder
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (folder: VaultFolder) => void
}

const mockTeamMembers: TeamMember[] = [
  { id: "1", name: "John Doe", email: "john.doe@cfi.com", role: "Admin", department: "IT" },
  { id: "2", name: "Jane Smith", email: "jane.smith@cfi.com", role: "Manager", department: "Operations" },
  { id: "3", name: "Mike Johnson", email: "mike.johnson@cfi.com", role: "Developer", department: "IT" },
  { id: "4", name: "Sarah Wilson", email: "sarah.wilson@cfi.com", role: "Analyst", department: "Finance" },
  { id: "5", name: "David Brown", email: "david.brown@cfi.com", role: "Designer", department: "Marketing" },
  { id: "6", name: "Lisa Garcia", email: "lisa.garcia@cfi.com", role: "HR Manager", department: "HR" },
  { id: "7", name: "Tom Anderson", email: "tom.anderson@cfi.com", role: "Sales Rep", department: "Sales" },
]

const permissionTemplates = [
  {
    name: "View Only",
    description: "Can view passwords but not edit or share",
    permissions: { view: true, edit: false, share: false }
  },
  {
    name: "Editor",
    description: "Can view and edit passwords but not share",
    permissions: { view: true, edit: true, share: false }
  },
  {
    name: "Full Access",
    description: "Can view, edit, and share passwords",
    permissions: { view: true, edit: true, share: true }
  }
]

export function ShareFolderDialog({ folder, open, onOpenChange, onUpdate }: ShareFolderDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>(folder.sharedWith)
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")

  useEffect(() => {
    setSharedUsers(folder.sharedWith)
  }, [folder.sharedWith, open])

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const isUserAlreadyShared = (email: string) => {
    return sharedUsers.some(user => user.userEmail === email)
  }

  const addTeamMember = (member: TeamMember, template: typeof permissionTemplates[0]) => {
    if (isUserAlreadyShared(member.email)) return

    const newUser: SharedUser = {
      userId: member.id,
      userName: member.name,
      userEmail: member.email,
      permissions: [
        { type: 'view', granted: template.permissions.view },
        { type: 'edit', granted: template.permissions.edit },
        { type: 'share', granted: template.permissions.share }
      ],
      sharedAt: new Date(),
      sharedBy: "current.user@cfi.com"
    }

    setSharedUsers([...sharedUsers, newUser])
  }

  const removeUser = (userId: string) => {
    setSharedUsers(sharedUsers.filter(user => user.userId !== userId))
  }

  const updatePermission = (userId: string, permissionType: 'view' | 'edit' | 'share', granted: boolean) => {
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
            { type: 'share', granted: template.permissions.share }
          ]
        }
      }
      return user
    }))
  }

  const handleSave = () => {
    const updatedFolder: VaultFolder = {
      ...folder,
      isShared: sharedUsers.length > 0,
      sharedWith: sharedUsers,
      updatedAt: new Date()
    }

    onUpdate(updatedFolder)
    onOpenChange(false)
  }

  const departments = Array.from(new Set(mockTeamMembers.map(m => m.department).filter(Boolean)))
  
  const filteredMembers = mockTeamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = selectedDepartment === "all" || member.department === selectedDepartment
    const notAlreadyShared = !isUserAlreadyShared(member.email)
    
    return matchesSearch && matchesDepartment && notAlreadyShared
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
            Manage who has access to this folder and all passwords within it. Users will be able to see, edit, or share passwords based on their permissions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Add Team Members */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Add Team Members</Label>
              <Badge variant="secondary">{sharedUsers.length} shared</Badge>
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Search by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.filter((dept): dept is string => Boolean(dept)).map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filteredMembers.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 hover:bg-muted rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{member.email}</span>
                          <span>•</span>
                          <span>{member.role}</span>
                          {member.department && (
                            <>
                              <span>•</span>
                              <span>{member.department}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {permissionTemplates.map((template) => (
                        <Button
                          key={template.name}
                          variant="outline"
                          size="sm"
                          onClick={() => addTeamMember(member, template)}
                          className="text-xs"
                        >
                          Add as {template.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
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
                            t.permissions.share === user.permissions.find(p => p.type === 'share')?.granted
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
                                {permission.type.charAt(0).toUpperCase() + permission.type.slice(1)}
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                {permission.type === 'view' && 'Can view passwords in this folder'}
                                {permission.type === 'edit' && 'Can edit and add passwords'}
                                {permission.type === 'share' && 'Can share passwords with others'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Shared on {new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }).format(user.sharedAt)} by {user.sharedBy}
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