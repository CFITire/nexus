"use client"

import { useState } from "react"
import { IconPlus, IconTrash, IconUserPlus } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PasswordEntry, SharedUser } from "@/lib/types/vault"

interface SharePasswordDialogProps {
  password: PasswordEntry
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (password: PasswordEntry) => void
}

const mockTeamMembers = [
  { id: "1", name: "John Doe", email: "john.doe@cfi.com" },
  { id: "2", name: "Jane Smith", email: "jane.smith@cfi.com" },
  { id: "3", name: "Mike Johnson", email: "mike.johnson@cfi.com" },
  { id: "4", name: "Sarah Wilson", email: "sarah.wilson@cfi.com" },
  { id: "5", name: "David Brown", email: "david.brown@cfi.com" },
]

export function SharePasswordDialog({ password, open, onOpenChange, onUpdate }: SharePasswordDialogProps) {
  const [newUserEmail, setNewUserEmail] = useState("")
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>(password.sharedWith)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const isUserAlreadyShared = (email: string) => {
    return sharedUsers.some(user => user.userEmail === email)
  }

  const addUserByEmail = () => {
    if (!newUserEmail || isUserAlreadyShared(newUserEmail)) return

    const newUser: SharedUser = {
      userId: Date.now().toString(),
      userName: newUserEmail.split('@')[0], // Simple name extraction
      userEmail: newUserEmail,
      permissions: [
        { type: 'view', granted: true },
        { type: 'edit', granted: false },
        { type: 'share', granted: false }
      ],
      sharedAt: new Date(),
      sharedBy: "current.user@cfi.com" // This would come from auth context
    }

    setSharedUsers([...sharedUsers, newUser])
    setNewUserEmail("")
  }

  const addTeamMember = (member: typeof mockTeamMembers[0]) => {
    if (isUserAlreadyShared(member.email)) return

    const newUser: SharedUser = {
      userId: member.id,
      userName: member.name,
      userEmail: member.email,
      permissions: [
        { type: 'view', granted: true },
        { type: 'edit', granted: false },
        { type: 'share', granted: false }
      ],
      sharedAt: new Date(),
      sharedBy: "current.user@cfi.com"
    }

    setSharedUsers([...sharedUsers, newUser])
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

  const handleSave = () => {
    const updatedPassword: PasswordEntry = {
      ...password,
      isShared: sharedUsers.length > 0,
      sharedWith: sharedUsers,
      updatedAt: new Date()
    }

    onUpdate(updatedPassword)
    onOpenChange(false)
  }

  const availableMembers = mockTeamMembers.filter(member => 
    !isUserAlreadyShared(member.email) &&
    member.email.toLowerCase().includes(newUserEmail.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share "{password.title}"</DialogTitle>
          <DialogDescription>
            Manage who has access to this password and their permissions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New User */}
          <div className="space-y-4">
            <Label>Add team member</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addUserByEmail()}
              />
              <Button onClick={addUserByEmail} disabled={!newUserEmail || isUserAlreadyShared(newUserEmail)}>
                <IconPlus className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Add Team Members */}
            {newUserEmail && availableMembers.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Suggested team members</Label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {availableMembers.slice(0, 5).map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                      onClick={() => addTeamMember(member)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <IconUserPlus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Current Shared Users */}
          <div className="space-y-4">
            <Label>Shared with ({sharedUsers.length})</Label>
            
            {sharedUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>This password is not shared with anyone</p>
                <p className="text-sm">Add team members above to start sharing</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sharedUsers.map((user) => (
                  <div key={user.userId} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(user.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.userName}</p>
                          <p className="text-sm text-muted-foreground">{user.userEmail}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-destructive"
                        onClick={() => removeUser(user.userId)}
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Permissions</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {user.permissions.map((permission) => (
                          <div key={permission.type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${user.userId}-${permission.type}`}
                              checked={permission.granted}
                              onCheckedChange={(checked) =>
                                updatePermission(user.userId, permission.type, checked as boolean)
                              }
                            />
                            <Label
                              htmlFor={`${user.userId}-${permission.type}`}
                              className="text-sm capitalize"
                            >
                              {permission.type}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-1 mt-2">
                        {user.permissions.filter(p => p.granted).map(permission => (
                          <Badge key={permission.type} variant="secondary" className="text-xs">
                            {permission.type}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
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