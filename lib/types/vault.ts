export interface PasswordEntry {
  id: string
  title: string
  username: string
  password: string
  url?: string
  notes?: string
  category: string
  folderId?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastAccessedAt?: Date
  isShared: boolean
  sharedWith: SharedUser[]
  tags: string[]
  isFavorite: boolean
}

export interface SharedUser {
  userId: string
  userName: string
  userEmail: string
  permissions: SharePermission[]
  sharedAt: Date
  sharedBy: string
}

export interface SharePermission {
  type: 'view' | 'edit' | 'share'
  granted: boolean
}

export interface VaultCategory {
  id: string
  name: string
  color: string
  icon: string
  isDefault: boolean
}

export interface VaultStats {
  totalPasswords: number
  sharedPasswords: number
  favoritePasswords: number
  recentlyAccessed: PasswordEntry[]
  weakPasswords: number
  duplicatePasswords: number
  totalFolders: number
}

export interface VaultFolder {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  parentId?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  isShared: boolean
  sharedWith: SharedUser[]
  permissions: FolderPermissions
}

export interface FolderPermissions {
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canShare: boolean
  canAddPasswords: boolean
}

export interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  department?: string
}