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
import { FolderManagement } from "@/components/folder-management"
import { FolderDialog } from "@/components/folder-dialog"
import { ShareFolderDialog } from "@/components/share-folder-dialog"
import { PasswordEntry, VaultFolder } from "@/lib/types/vault"

const mockFolders: VaultFolder[] = [
  {
    id: "1",
    name: "Work Accounts",
    description: "Business and work-related passwords",
    color: "#3b82f6",
    icon: "briefcase",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    createdBy: "john.doe@cfi.com",
    isShared: true,
    sharedWith: [
      {
        userId: "2",
        userName: "Jane Smith",
        userEmail: "jane.smith@cfi.com",
        permissions: [
          { type: "view", granted: true },
          { type: "edit", granted: true },
          { type: "share", granted: false }
        ],
        sharedAt: new Date("2024-01-02"),
        sharedBy: "john.doe@cfi.com"
      }
    ],
    permissions: {
      canView: true,
      canEdit: true,
      canDelete: true,
      canShare: true,
      canAddPasswords: true,
    }
  },
  {
    id: "2",
    name: "Development",
    description: "Development servers and tools",
    color: "#10b981",
    icon: "code",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
    createdBy: "john.doe@cfi.com",
    isShared: true,
    sharedWith: [
      {
        userId: "3",
        userName: "Mike Johnson",
        userEmail: "mike.johnson@cfi.com",
        permissions: [
          { type: "view", granted: true },
          { type: "edit", granted: true },
          { type: "share", granted: true }
        ],
        sharedAt: new Date("2024-02-02"),
        sharedBy: "john.doe@cfi.com"
      }
    ],
    permissions: {
      canView: true,
      canEdit: true,
      canDelete: true,
      canShare: true,
      canAddPasswords: true,
    }
  }
]

const mockPasswords: PasswordEntry[] = [
  {
    id: "1",
    title: "Business Central Admin",
    username: "admin@cfi.com",
    password: "SecurePass123!",
    url: "https://businesscentral.dynamics.com",
    notes: "Admin account for Business Central integration",
    category: "Business Apps",
    folderId: "1",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    createdBy: "john.doe@cfi.com",
    lastAccessedAt: new Date("2024-06-07"),
    isShared: true,
    sharedWith: [
      {
        userId: "2",
        userName: "Jane Smith",
        userEmail: "jane.smith@cfi.com",
        permissions: [
          { type: "view", granted: true },
          { type: "edit", granted: false },
          { type: "share", granted: false }
        ],
        sharedAt: new Date("2024-02-01"),
        sharedBy: "john.doe@cfi.com"
      }
    ],
    tags: ["business", "admin", "critical"],
    isFavorite: true
  },
  {
    id: "2",
    title: "Company WiFi",
    username: "guest",
    password: "CFI-Guest-2024",
    url: "",
    notes: "Guest WiFi password for office visitors",
    category: "Office",
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-01"),
    createdBy: "it@cfi.com",
    lastAccessedAt: new Date("2024-06-06"),
    isShared: true,
    sharedWith: [
      {
        userId: "3",
        userName: "Mike Johnson",
        userEmail: "mike.johnson@cfi.com",
        permissions: [
          { type: "view", granted: true },
          { type: "edit", granted: false },
          { type: "share", granted: true }
        ],
        sharedAt: new Date("2024-03-02"),
        sharedBy: "it@cfi.com"
      }
    ],
    tags: ["wifi", "guest", "office"],
    isFavorite: false
  },
  {
    id: "3",
    title: "Shared Development Database",
    username: "dev_user",
    password: "DevDB@2024!Secure",
    url: "db.dev.cfi.com",
    notes: "Development database credentials for team access",
    category: "Development",
    folderId: "2",
    createdAt: new Date("2024-04-10"),
    updatedAt: new Date("2024-05-15"),
    createdBy: "dev.team@cfi.com",
    lastAccessedAt: new Date("2024-06-05"),
    isShared: true,
    sharedWith: [
      {
        userId: "4",
        userName: "Sarah Wilson",
        userEmail: "sarah.wilson@cfi.com",
        permissions: [
          { type: "view", granted: true },
          { type: "edit", granted: true },
          { type: "share", granted: false }
        ],
        sharedAt: new Date("2024-04-11"),
        sharedBy: "dev.team@cfi.com"
      }
    ],
    tags: ["database", "development", "team"],
    isFavorite: true
  },
  {
    id: "4",
    title: "GitHub Enterprise",
    username: "cfi-developer",
    password: "ghp_SecureToken2024!",
    url: "https://github.com/cfi-org",
    notes: "Enterprise GitHub access for code repositories",
    category: "Development",
    folderId: "2",
    createdAt: new Date("2024-05-01"),
    updatedAt: new Date("2024-05-01"),
    createdBy: "dev.team@cfi.com",
    lastAccessedAt: new Date("2024-06-08"),
    isShared: false,
    sharedWith: [],
    tags: ["github", "development", "enterprise"],
    isFavorite: false
  }
]

export function VaultContent() {
  const [passwords, setPasswords] = useState<PasswordEntry[]>(mockPasswords)
  const [folders, setFolders] = useState<VaultFolder[]>(mockFolders)
  const [filteredPasswords, setFilteredPasswords] = useState<PasswordEntry[]>(mockPasswords)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showFolderDialog, setShowFolderDialog] = useState(false)
  const [showShareFolderDialog, setShowShareFolderDialog] = useState(false)
  const [editingFolder, setEditingFolder] = useState<VaultFolder | null>(null)
  const [sharingFolder, setSharingFolder] = useState<VaultFolder | null>(null)

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

  const handleAddPassword = (newPassword: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const password: PasswordEntry = {
      ...newPassword,
      id: Date.now().toString(),
      folderId: selectedFolderId === 'unorganized' ? undefined : selectedFolderId || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setPasswords([...passwords, password])
  }

  const handleCreateFolder = () => {
    setEditingFolder(null)
    setShowFolderDialog(true)
  }

  const handleEditFolder = (folder: VaultFolder) => {
    setEditingFolder(folder)
    setShowFolderDialog(true)
  }

  const handleSaveFolder = (folderData: Omit<VaultFolder, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingFolder) {
      // Edit existing folder
      const updatedFolder: VaultFolder = {
        ...editingFolder,
        ...folderData,
        updatedAt: new Date()
      }
      setFolders(prev => prev.map(f => f.id === editingFolder.id ? updatedFolder : f))
    } else {
      // Create new folder
      const newFolder: VaultFolder = {
        ...folderData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setFolders([...folders, newFolder])
    }
  }

  const handleShareFolder = (folder: VaultFolder) => {
    setSharingFolder(folder)
    setShowShareFolderDialog(true)
  }

  const handleUpdateFolder = (updatedFolder: VaultFolder) => {
    setFolders(prev => prev.map(f => f.id === updatedFolder.id ? updatedFolder : f))
  }

  const handleDeleteFolder = (folderId: string) => {
    // Move passwords from this folder to unorganized
    setPasswords(prev => prev.map(p => p.folderId === folderId ? { ...p, folderId: undefined } : p))
    setFolders(prev => prev.filter(f => f.id !== folderId))
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null)
    }
  }

  const getCurrentFolderName = () => {
    if (!selectedFolderId) return "All Passwords"
    if (selectedFolderId === 'unorganized') return "Unorganized"
    const folder = folders.find(f => f.id === selectedFolderId)
    return folder?.name || "Unknown Folder"
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
                <div className="grid gap-4">
                  {filteredPasswords.length > 0 ? (
                    filteredPasswords.map((password) => (
                      <VaultPasswordCard
                        key={password.id}
                        password={password}
                        onUpdate={(updatedPassword) => {
                          setPasswords(prev => 
                            prev.map(p => p.id === updatedPassword.id ? updatedPassword : p)
                          )
                        }}
                        onDelete={(id) => {
                          setPasswords(prev => prev.filter(p => p.id !== id))
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