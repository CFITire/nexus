"use client"

import { useState } from "react"
import { IconCopy, IconEye, IconEyeOff, IconShare, IconStar, IconStarFilled, IconEdit, IconTrash, IconExternalLink, IconRocket } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PasswordEntry } from "@/lib/types/vault"
import { SharePasswordDialog } from "@/components/share-password-dialog"

interface VaultPasswordCardProps {
  password: PasswordEntry
  onUpdate: (password: PasswordEntry) => void
  onEdit: (password: PasswordEntry) => void
  onDelete: (id: string) => Promise<void>
}

export function VaultPasswordCard({ password, onUpdate, onEdit, onDelete }: VaultPasswordCardProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Check permissions (TODO: get actual current user instead of hardcoded)
  const currentUser = 'current.user@cfi.com'
  const isOwner = password.createdBy === currentUser
  const userShare = password.sharedWith.find(user => user.userEmail === currentUser)
  const canEdit = isOwner || (userShare?.permissions.some(p => p.type === 'edit' && p.granted) ?? false)
  const canShare = isOwner || (userShare?.permissions.some(p => p.type === 'share' && p.granted) ?? false)
  const canDelete = isOwner // Only owner can delete

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
      console.log(`${type} copied to clipboard`)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const toggleFavorite = () => {
    onUpdate({
      ...password,
      isFavorite: !password.isFavorite,
      updatedAt: new Date()
    })
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Unknown'
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date'
    }
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(dateObj)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const launchAndFill = async () => {
    if (!password.url) return
    
    try {
      // First copy username to clipboard
      await navigator.clipboard.writeText(password.username)
      
      // Open the URL in a new tab
      const newWindow = window.open(password.url, '_blank')
      
      // Show user instructions
      alert(`Launched ${password.url}\n\nUsername copied to clipboard: ${password.username}\n\nTo complete login:\n1. Paste username (Ctrl+V)\n2. Click the 🔑 button to copy password\n3. Paste password in password field`)
      
      console.log('Launched URL and copied username to clipboard')
    } catch (err) {
      console.error('Failed to launch and fill:', err)
      // Fallback: just open the URL
      if (password.url) {
        window.open(password.url, '_blank')
      }
    }
  }

  return (
    <TooltipProvider>
      <Card className="group hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg">{password.title}</CardTitle>
                {password.url && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={launchAndFill}
                        >
                          <IconRocket className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Launch & Fill</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => window.open(password.url, '_blank')}
                        >
                          <IconExternalLink className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Open URL</TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
              <CardDescription className="flex items-center gap-2">
                <span>{password.username}</span>
                <Badge variant="secondary" className="text-xs">
                  {password.category}
                </Badge>
              </CardDescription>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={toggleFavorite}
                  >
                    {password.isFavorite ? (
                      <IconStarFilled className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <IconStar className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {password.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                </TooltipContent>
              </Tooltip>
              {canShare && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowShareDialog(true)}
                    >
                      <IconShare className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share password</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Password Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Password</label>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <IconEyeOff className="h-3 w-3" />
                      ) : (
                        <IconEye className="h-3 w-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {showPassword ? 'Hide password' : 'Show password'}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(password.password, 'Password')}
                    >
                      🔑
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy password</TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="font-mono text-sm bg-muted p-2 rounded">
              {showPassword ? password.password : '••••••••••••'}
            </div>
          </div>

          {/* Username Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Username</label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(password.username, 'Username')}
                  >
                    <IconCopy className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy username</TooltipContent>
              </Tooltip>
            </div>
            <div className="text-sm bg-muted p-2 rounded">
              {password.username}
            </div>
          </div>

          {/* Notes */}
          {password.notes && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                {password.notes}
              </div>
            </div>
          )}

          {/* Tags */}
          {password.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {password.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Shared Users */}
          {password.isShared && password.sharedWith.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Shared with</label>
              <div className="flex items-center gap-2">
                {password.sharedWith.slice(0, 3).map((user) => (
                  <Tooltip key={user.userId}>
                    <TooltipTrigger asChild>
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(user.userName)}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div>
                        <p className="font-medium">{user.userName}</p>
                        <p className="text-xs text-muted-foreground">{user.userEmail}</p>
                        <div className="flex gap-1 mt-1">
                          {user.permissions.filter(p => p.granted).map(p => (
                            <Badge key={p.type} variant="outline" className="text-xs">
                              {p.type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {password.sharedWith.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{password.sharedWith.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
            <span>
              Created {formatDate(password.createdAt)}
              {password.lastAccessedAt && (
                <> • Last used {formatDate(password.lastAccessedAt)}</>
              )}
            </span>
            <div className="flex gap-1">
              {canEdit && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => onEdit(password)}
                  disabled={isDeleting}
                >
                  <IconEdit className="h-3 w-3" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:text-destructive"
                  onClick={async () => {
                    if (isDeleting) return
                    setIsDeleting(true)
                    try {
                      await onDelete(password.id)
                    } finally {
                      setIsDeleting(false)
                    }
                  }}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <IconTrash className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>

        <SharePasswordDialog
          password={password}
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          onUpdate={onUpdate}
        />
      </Card>
    </TooltipProvider>
  )
}