"use client"

import { useState, useEffect } from "react"
import { IconPlus, IconSearch, IconFolderPlus, IconFolder } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VaultPasswordCard } from "@/components/vault-password-card"
import { VaultStats } from "@/components/vault-stats"
import { AddPasswordDialog } from "@/components/add-password-dialog"
import { EditPasswordDialog } from "@/components/edit-password-dialog"
import { FolderManagement } from "@/components/folder-management"
import { FolderDialog } from "@/components/folder-dialog"
import { ShareFolderDialog } from "@/components/share-folder-dialog"
import { PasswordEntry, VaultFolder } from "@/lib/types/vault"
import { useRBAC } from "@/hooks/use-rbac"
import { toast } from "sonner"

// API Functions
async function fetchFolders(): Promise<VaultFolder[]> {
  const response = await fetch('/api/vault/folders')
  if (!response.ok) {
    throw new Error('Failed to fetch folders')
  }
  return response.json()
}

async function fetchPasswords(folderId?: string): Promise<PasswordEntry[]> {
  const url = folderId ? `/api/vault/passwords?folderId=${folderId}` : '/api/vault/passwords'
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch passwords')
  }
  return response.json()
}

async function createFolder(data: any): Promise<VaultFolder> {
  const response = await fetch('/api/vault/folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    throw new Error('Failed to create folder')
  }
  return response.json()
}

async function updateFolder(id: string, data: any): Promise<VaultFolder> {
  const response = await fetch(`/api/vault/folders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    throw new Error('Failed to update folder')
  }
  return response.json()
}

async function deleteFolder(id: string): Promise<void> {
  const response = await fetch(`/api/vault/folders/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) {
    throw new Error('Failed to delete folder')
  }
}

async function createPassword(data: any): Promise<PasswordEntry> {
  const response = await fetch('/api/vault/passwords', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    throw new Error('Failed to create password')
  }
  return response.json()
}

async function updatePassword(id: string, data: any): Promise<PasswordEntry> {
  const response = await fetch(`/api/vault/passwords/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.details || 'Failed to update password')
  }
  return response.json()
}

async function deletePassword(id: string): Promise<void> {
  const response = await fetch(`/api/vault/passwords/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) {
    throw new Error('Failed to delete password')
  }
}

export function VaultContent() {
  const { hasModuleAccess, loading: rbacLoading } = useRBAC()
  const [passwords, setPasswords] = useState<PasswordEntry[]>([])
  const [folders, setFolders] = useState<VaultFolder[]>([])
  const [filteredPasswords, setFilteredPasswords] = useState<PasswordEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showFolderDialog, setShowFolderDialog] = useState(false)
  const [showShareFolderDialog, setShowShareFolderDialog] = useState(false)
  const [editingFolder, setEditingFolder] = useState<VaultFolder | null>(null)
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null)
  const [sharingFolder, setSharingFolder] = useState<VaultFolder | null>(null)

  // Load initial data
  useEffect(() => {
    if (rbacLoading) return
    
    if (!hasModuleAccess('vault')) {
      toast.error('Access denied to vault module')
      setLoading(false)
      return
    }

    loadData()
  }, [rbacLoading]) // Remove hasModuleAccess from dependencies

  const loadData = async () => {
    try {
      setLoading(true)
      console.log('Loading vault data...')
      const [foldersData, passwordsData] = await Promise.all([
        fetchFolders(),
        fetchPasswords()
      ])
      console.log('Loaded folders:', foldersData)
      console.log('Loaded passwords:', passwordsData)
      setFolders(foldersData)
      setPasswords(passwordsData)
      console.log('Vault data loaded successfully')
    } catch (error) {
      console.error('Failed to load vault data:', error)
      toast.error('Failed to load vault data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = passwords

    // Filter by folder
    if (selectedFolderId === 'unorganized') {
      filtered = filtered.filter(p => !p.folderId)
    } else if (selectedFolderId) {
      filtered = filtered.filter(p => p.folderId === selectedFolderId)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (password) =>
          password.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          password.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          password.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          password.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          password.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by tab
    switch (activeTab) {
      case "favorites":
        filtered = filtered.filter(p => p.isFavorite)
        break
      case "shared":
        filtered = filtered.filter(p => p.isShared)
        break
      case "recent":
        filtered = filtered
          .filter(p => p.lastAccessedAt)
          .sort((a, b) => new Date(b.lastAccessedAt!).getTime() - new Date(a.lastAccessedAt!).getTime())
          .slice(0, 10)
        break
    }

    setFilteredPasswords(filtered)
  }, [passwords, searchQuery, activeTab, selectedFolderId])

  const handleAddPassword = async (newPassword: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isShared' | 'sharedWith'>) => {
    try {
      const passwordData = {
        ...newPassword,
        folderId: selectedFolderId === 'unorganized' ? undefined : selectedFolderId || undefined,
      }
      const password = await createPassword(passwordData)
      setPasswords([...passwords, password])
      toast.success('Password created successfully')
    } catch (error) {
      console.error('Failed to create password:', error)
      toast.error('Failed to create password')
    }
  }

  const handleEditPassword = (password: PasswordEntry) => {
    // Check if user can edit this password
    const canEdit = password.createdBy === 'current.user@cfi.com' || // Owner can always edit (TODO: get actual current user)
                   password.sharedWith.some(user => 
                     user.userEmail === 'current.user@cfi.com' && // TODO: get actual current user
                     user.permissions.some(p => p.type === 'edit' && p.granted)
                   )
    
    if (!canEdit) {
      toast.error('You do not have permission to edit this password. Please contact your administrator.')
      return
    }
    
    setEditingPassword(password)
    setShowEditDialog(true)
  }

  const handleUpdatePassword = async (updatedPassword: PasswordEntry) => {
    try {
      const updated = await updatePassword(updatedPassword.id, updatedPassword)
      setPasswords(prev => 
        prev.map(p => p.id === updated.id ? updated : p)
      )
      toast.success('Password updated successfully')
    } catch (error) {
      console.error('Failed to update password:', error)
      
      // Check if it's a permission error
      if (error instanceof Error && error.message.includes('Access denied')) {
        toast.error('You do not have permission to edit this password. Please contact your administrator.')
      } else {
        toast.error('Failed to update password')
      }
    }
  }

  const handleCreateFolder = () => {
    setEditingFolder(null)
    setShowFolderDialog(true)
  }

  const handleEditFolder = (folder: VaultFolder) => {
    setEditingFolder(folder)
    setShowFolderDialog(true)
  }

  const handleSaveFolder = async (folderData: Omit<VaultFolder, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isShared' | 'sharedWith' | 'permissions'>) => {
    try {
      if (editingFolder) {
        // Edit existing folder
        const updatedFolder = await updateFolder(editingFolder.id, folderData)
        setFolders(prev => prev.map(f => f.id === editingFolder.id ? updatedFolder : f))
        toast.success('Folder updated successfully')
      } else {
        // Create new folder
        const newFolder = await createFolder(folderData)
        setFolders([...folders, newFolder])
        toast.success('Folder created successfully')
      }
    } catch (error) {
      console.error('Failed to save folder:', error)
      toast.error('Failed to save folder')
    }
  }

  const handleShareFolder = (folder: VaultFolder) => {
    setSharingFolder(folder)
    setShowShareFolderDialog(true)
  }

  const handleUpdateFolder = (updatedFolder: VaultFolder) => {
    // Update local state (sharing is handled by the share dialog directly)
    setFolders(prev => prev.map(f => f.id === updatedFolder.id ? updatedFolder : f))
  }

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await deleteFolder(folderId)
      // Move passwords from this folder to unorganized
      setPasswords(prev => prev.map(p => p.folderId === folderId ? { ...p, folderId: undefined } : p))
      setFolders(prev => prev.filter(f => f.id !== folderId))
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null)
      }
      toast.success('Folder deleted successfully')
    } catch (error) {
      console.error('Failed to delete folder:', error)
      toast.error('Failed to delete folder')
    }
  }

  const getCurrentFolderName = () => {
    if (!selectedFolderId) return "All Passwords"
    if (selectedFolderId === 'unorganized') return "Unorganized"
    const folder = folders.find(f => f.id === selectedFolderId)
    return folder?.name || "Unknown Folder"
  }

  // Show loading state
  if (rbacLoading || loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading vault...</p>
        </div>
      </div>
    )
  }

  // Check vault access
  if (!hasModuleAccess('vault')) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Access Denied</p>
          <p className="text-sm text-muted-foreground">You don't have permission to access the vault module.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col lg:flex-row gap-4 lg:gap-6 p-4 lg:p-6">
      {/* Main Content */}
      <div className="flex-1 order-1">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-2 md:py-4 lg:py-6">
            
            {/* Header */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">{getCurrentFolderName()}</h1>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {selectedFolderId 
                      ? `Managing passwords in ${getCurrentFolderName().toLowerCase()}`
                      : "Securely store and share passwords with your team"
                    }
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreateFolder} 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2 lg:hidden"
                  >
                    <IconFolderPlus className="h-4 w-4" />
                    New Folder
                  </Button>
                  <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
                    <IconPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Password</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div>
              <VaultStats passwords={filteredPasswords} />
            </div>

          {/* Search and Filters */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search passwords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Passwords</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
                <TabsTrigger value="shared">Shared</TabsTrigger>
                <TabsTrigger value="recent">Recently Used</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredPasswords.length > 0 ? (
                    filteredPasswords.map((password) => (
                      <VaultPasswordCard
                        key={password.id}
                        password={password}
                        onUpdate={async (updatedPassword) => {
                          try {
                            const updated = await updatePassword(password.id, updatedPassword)
                            setPasswords(prev => 
                              prev.map(p => p.id === updated.id ? updated : p)
                            )
                            toast.success('Password updated successfully')
                          } catch (error) {
                            console.error('Failed to update password:', error)
                            toast.error('Failed to update password')
                          }
                        }}
                        onEdit={handleEditPassword}
                        onDelete={async (id) => {
                          try {
                            await deletePassword(id)
                            setPasswords(prev => prev.filter(p => p.id !== id))
                            toast.success('Password deleted successfully')
                          } catch (error) {
                            console.error('Failed to delete password:', error)
                            toast.error('Failed to delete password')
                          }
                        }}
                      />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <p className="text-muted-foreground mb-2">No passwords found</p>
                          <p className="text-sm text-muted-foreground">
                            {searchQuery ? "Try adjusting your search terms" : "Add your first password to get started"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          </div>
        </div>
      </div>

      {/* Right Sidebar - Folder Management (Hidden on mobile, shown on desktop) */}
      <div className="hidden lg:block lg:w-80 lg:flex-shrink-0 order-2">
        <div className="lg:sticky lg:top-4">
          <FolderManagement
            folders={folders}
            passwords={passwords}
            onFolderSelect={setSelectedFolderId}
            selectedFolderId={selectedFolderId}
            onCreateFolder={handleCreateFolder}
            onShareFolder={handleShareFolder}
            onEditFolder={handleEditFolder}
            onDeleteFolder={handleDeleteFolder}
          />
        </div>
      </div>

      {/* Mobile Folder Selector */}
      <div className="lg:hidden order-3">
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3">Quick Folder Access</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedFolderId(null)}
              className={`p-3 rounded-lg border text-sm text-left transition-colors ${
                selectedFolderId === null 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : 'border-border hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-primary/10">
                  <IconFolder className="h-3 w-3 text-primary" />
                </div>
                <span className="truncate">All</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {passwords.length} passwords
              </div>
            </button>
            
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id)}
                className={`p-3 rounded-lg border text-sm text-left transition-colors ${
                  selectedFolderId === folder.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="p-1 rounded"
                    style={{ backgroundColor: `${folder.color}20` }}
                  >
                    <IconFolder className="h-3 w-3" style={{ color: folder.color }} />
                  </div>
                  <span className="truncate">{folder.name}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {passwords.filter(p => p.folderId === folder.id).length} passwords
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <AddPasswordDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddPassword}
        folders={folders}
        selectedFolderId={selectedFolderId}
      />

      <EditPasswordDialog
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open)
          if (!open) setEditingPassword(null)
        }}
        onUpdate={handleUpdatePassword}
        password={editingPassword}
        folders={folders}
      />

      <FolderDialog
        open={showFolderDialog}
        onOpenChange={setShowFolderDialog}
        onSave={handleSaveFolder}
        folder={editingFolder}
        mode={editingFolder ? 'edit' : 'create'}
      />

      {sharingFolder && (
        <ShareFolderDialog
          folder={sharingFolder}
          open={showShareFolderDialog}
          onOpenChange={(open) => {
            setShowShareFolderDialog(open)
            if (!open) setSharingFolder(null)
          }}
          onUpdate={handleUpdateFolder}
        />
      )}
    </div>
  )
}