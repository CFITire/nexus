"use client"

import { IconFolder, IconFolderPlus, IconShare, IconUsers, IconSettings, IconLock, IconDots } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { VaultFolder, PasswordEntry } from "@/lib/types/vault"

interface FolderManagementProps {
  folders: VaultFolder[]
  passwords: PasswordEntry[]
  onFolderSelect: (folderId: string | null) => void
  selectedFolderId: string | null
  onCreateFolder: () => void
  onShareFolder: (folder: VaultFolder) => void
  onEditFolder: (folder: VaultFolder) => void
  onDeleteFolder: (folderId: string) => void
}

export function FolderManagement({
  folders,
  passwords,
  onFolderSelect,
  selectedFolderId,
  onCreateFolder,
  onShareFolder,
  onEditFolder,
  onDeleteFolder,
}: FolderManagementProps) {
  const getPasswordCountInFolder = (folderId: string) => {
    return passwords.filter(p => p.folderId === folderId).length
  }

  const getUnorganizedPasswordCount = () => {
    return passwords.filter(p => !p.folderId).length
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getFolderIcon = (iconName: string) => {
    switch (iconName) {
      case 'folder':
        return <IconFolder className="h-4 w-4" />
      case 'lock':
        return <IconLock className="h-4 w-4" />
      case 'users':
        return <IconUsers className="h-4 w-4" />
      default:
        return <IconFolder className="h-4 w-4" />
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Folders</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateFolder}
            className="flex items-center gap-2"
          >
            <IconFolderPlus className="h-4 w-4" />
            New Folder
          </Button>
        </div>

        <div className="space-y-2">
          {/* All Passwords */}
          <Card
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              selectedFolderId === null ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onFolderSelect(null)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <IconFolder className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">All Passwords</p>
                    <p className="text-sm text-muted-foreground">
                      {passwords.length} passwords
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unorganized Passwords */}
          {getUnorganizedPasswordCount() > 0 && (
            <Card
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                selectedFolderId === 'unorganized' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onFolderSelect('unorganized')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-muted">
                      <IconFolder className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Unorganized</p>
                      <p className="text-sm text-muted-foreground">
                        {getUnorganizedPasswordCount()} passwords
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Custom Folders */}
          {folders.map((folder) => (
            <Card
              key={folder.id}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                selectedFolderId === folder.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onFolderSelect(folder.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="p-2 rounded-md"
                      style={{ backgroundColor: `${folder.color}20` }}
                    >
                      <div style={{ color: folder.color }}>
                        {getFolderIcon(folder.icon)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{folder.name}</p>
                        {folder.isShared && (
                          <Tooltip>
                            <TooltipTrigger>
                              <IconShare className="h-3 w-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Shared with {folder.sharedWith.length} people
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                          {getPasswordCountInFolder(folder.id)} passwords
                        </p>
                        {folder.isShared && (
                          <div className="flex -space-x-1">
                            {folder.sharedWith.slice(0, 3).map((user) => (
                              <Avatar key={user.userId} className="h-5 w-5 border-2 border-background">
                                <AvatarFallback className="text-xs">
                                  {getInitials(user.userName)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {folder.sharedWith.length > 3 && (
                              <div className="h-5 w-5 bg-muted rounded-full border-2 border-background flex items-center justify-center text-xs text-muted-foreground">
                                +{folder.sharedWith.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <IconDots className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditFolder(folder)}>
                        <IconSettings className="h-4 w-4 mr-2" />
                        Edit Folder
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onShareFolder(folder)}>
                        <IconShare className="h-4 w-4 mr-2" />
                        Share Folder
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDeleteFolder(folder.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        Delete Folder
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}