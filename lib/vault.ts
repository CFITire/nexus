import { prisma } from './prisma'
import { getUserPermissions } from './rbac'
import { encryptPassword, decryptPassword, encryptedDataFromString, encryptedDataToString } from './encryption'
import { PasswordEntry, VaultFolder, SharedUser } from './types/vault'

export interface VaultService {
  // Folders
  getFolders(userId: string): Promise<VaultFolder[]>
  createFolder(userId: string, data: Omit<VaultFolder, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isShared' | 'sharedWith' | 'permissions'>): Promise<VaultFolder>
  updateFolder(userId: string, folderId: string, data: Partial<VaultFolder>): Promise<VaultFolder>
  deleteFolder(userId: string, folderId: string): Promise<void>
  shareFolder(userId: string, folderId: string, shareWith: string, permissions: any): Promise<void>
  
  // Passwords
  getPasswords(userId: string, folderId?: string): Promise<PasswordEntry[]>
  getPassword(userId: string, passwordId: string): Promise<PasswordEntry>
  createPassword(userId: string, data: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isShared' | 'sharedWith'>): Promise<PasswordEntry>
  updatePassword(userId: string, passwordId: string, data: Partial<PasswordEntry>): Promise<PasswordEntry>
  deletePassword(userId: string, passwordId: string): Promise<void>
  sharePassword(userId: string, passwordId: string, shareWith: string, permissions: any): Promise<void>
  
  // Access logging
  logAccess(userId: string, passwordId: string, action: string, ipAddress?: string, userAgent?: string): Promise<void>
}

class VaultServiceImpl implements VaultService {
  async getFolders(userId: string): Promise<VaultFolder[]> {
    const folders = await prisma.vaultFolder.findMany({
      where: {
        OR: [
          { createdBy: userId },
          { shares: { some: { sharedWith: userId, canView: true } } }
        ]
      },
      include: {
        shares: true,
        passwords: {
          select: { id: true }
        }
      }
    })

    return folders.map((folder: any) => this.mapDbFolderToVaultFolder(folder, userId))
  }

  async createFolder(userId: string, data: Omit<VaultFolder, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isShared' | 'sharedWith' | 'permissions'>): Promise<VaultFolder> {
    const folder = await prisma.vaultFolder.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        parentId: data.parentId,
        createdBy: userId
      },
      include: {
        shares: true,
        passwords: { select: { id: true } }
      }
    })

    return this.mapDbFolderToVaultFolder(folder, userId)
  }

  async updateFolder(userId: string, folderId: string, data: Partial<VaultFolder>): Promise<VaultFolder> {
    // Check permissions
    await this.requireFolderAccess(userId, folderId, 'edit')

    const folder = await prisma.vaultFolder.update({
      where: { id: folderId },
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        parentId: data.parentId
      },
      include: {
        shares: true,
        passwords: { select: { id: true } }
      }
    })

    return this.mapDbFolderToVaultFolder(folder, userId)
  }

  async deleteFolder(userId: string, folderId: string): Promise<void> {
    await this.requireFolderAccess(userId, folderId, 'delete')

    await prisma.vaultFolder.delete({
      where: { id: folderId }
    })
  }

  async shareFolder(userId: string, folderId: string, shareWith: string, permissions: any): Promise<void> {
    await this.requireFolderAccess(userId, folderId, 'share')

    await prisma.vaultFolderShare.upsert({
      where: {
        folderId_sharedWith: {
          folderId,
          sharedWith: shareWith
        }
      },
      create: {
        folderId,
        sharedWith: shareWith,
        sharedBy: userId,
        canView: permissions.canView || false,
        canEdit: permissions.canEdit || false,
        canDelete: permissions.canDelete || false,
        canShare: permissions.canShare || false,
        canAddPasswords: permissions.canAddPasswords || false
      },
      update: {
        canView: permissions.canView || false,
        canEdit: permissions.canEdit || false,
        canDelete: permissions.canDelete || false,
        canShare: permissions.canShare || false,
        canAddPasswords: permissions.canAddPasswords || false
      }
    })
  }

  async getPasswords(userId: string, folderId?: string): Promise<PasswordEntry[]> {
    let whereClause: any = {
      OR: [
        { createdBy: userId },
        { shares: { some: { sharedWith: userId, canView: true } } }
      ]
    }

    // If filtering by folder, add folder condition
    if (folderId) {
      whereClause = {
        AND: [
          { folderId },
          {
            OR: [
              { createdBy: userId },
              { shares: { some: { sharedWith: userId, canView: true } } },
              // Also include passwords in folders that are shared with the user
              { 
                folder: { 
                  OR: [
                    { createdBy: userId },
                    { shares: { some: { sharedWith: userId, canView: true } } }
                  ]
                }
              }
            ]
          }
        ]
      }
    }

    const passwords = await prisma.passwordEntry.findMany({
      where: whereClause,
      include: {
        shares: true,
        folder: true
      }
    })

    return passwords.map((password: any) => this.mapDbPasswordToPasswordEntry(password))
  }

  async getPassword(userId: string, passwordId: string): Promise<PasswordEntry> {
    await this.requirePasswordAccess(userId, passwordId, 'view')

    const password = await prisma.passwordEntry.findUniqueOrThrow({
      where: { id: passwordId },
      include: {
        shares: true,
        folder: true
      }
    })

    // Log access
    await this.logAccess(userId, passwordId, 'VIEW')

    return this.mapDbPasswordToPasswordEntry(password)
  }

  async createPassword(userId: string, data: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isShared' | 'sharedWith'>): Promise<PasswordEntry> {
    // If adding to a folder, check folder permissions
    let folderShares: any[] = []
    if (data.folderId) {
      await this.requireFolderAccess(userId, data.folderId, 'addPasswords')
      
      // Get folder shares to inherit permissions
      const folder = await prisma.vaultFolder.findUnique({
        where: { id: data.folderId },
        include: { shares: true }
      })
      folderShares = folder?.shares || []
    }

    // Encrypt the password
    const encryptedData = encryptPassword(data.password)

    const password = await prisma.passwordEntry.create({
      data: {
        title: data.title,
        username: data.username,
        encryptedPassword: encryptedDataToString(encryptedData),
        url: data.url,
        notes: data.notes,
        category: data.category,
        tags: JSON.stringify(data.tags),
        isFavorite: data.isFavorite,
        folderId: data.folderId,
        createdBy: userId
      },
      include: {
        shares: true,
        folder: true
      }
    })

    // If the password is in a shared folder, automatically share it with the same users
    if (data.folderId && folderShares.length > 0) {
      for (const folderShare of folderShares) {
        await prisma.passwordShare.create({
          data: {
            passwordId: password.id,
            sharedWith: folderShare.sharedWith,
            sharedBy: userId,
            canView: folderShare.canView,
            canEdit: folderShare.canEdit,
            canShare: folderShare.canShare
          }
        })
      }
    }

    await this.logAccess(userId, password.id, 'CREATE')

    // Re-fetch the password with the new shares
    const updatedPassword = await prisma.passwordEntry.findUniqueOrThrow({
      where: { id: password.id },
      include: {
        shares: true,
        folder: true
      }
    })

    return this.mapDbPasswordToPasswordEntry(updatedPassword)
  }

  async updatePassword(userId: string, passwordId: string, data: Partial<PasswordEntry>): Promise<PasswordEntry> {
    await this.requirePasswordAccess(userId, passwordId, 'edit')

    const updateData: any = {}

    if (data.title !== undefined) updateData.title = data.title
    if (data.username !== undefined) updateData.username = data.username
    if (data.password !== undefined) {
      const encryptedData = encryptPassword(data.password)
      updateData.encryptedPassword = encryptedDataToString(encryptedData)
    }
    if (data.url !== undefined) updateData.url = data.url
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.category !== undefined) updateData.category = data.category
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags)
    if (data.isFavorite !== undefined) updateData.isFavorite = data.isFavorite
    if (data.folderId !== undefined) updateData.folderId = data.folderId

    const password = await prisma.passwordEntry.update({
      where: { id: passwordId },
      data: updateData,
      include: {
        shares: true,
        folder: true
      }
    })

    await this.logAccess(userId, passwordId, 'EDIT')

    return this.mapDbPasswordToPasswordEntry(password)
  }

  async deletePassword(userId: string, passwordId: string): Promise<void> {
    await this.requirePasswordAccess(userId, passwordId, 'delete')

    // Use a transaction to ensure all related data is deleted properly
    await prisma.$transaction(async (tx: any) => {
      // Delete related shares first
      await tx.passwordShare.deleteMany({
        where: { passwordId }
      })

      // Delete access logs
      await tx.vaultAccessLog.deleteMany({
        where: { passwordId }
      })

      // Finally delete the password entry
      await tx.passwordEntry.delete({
        where: { id: passwordId }
      })
    })

    // Log the deletion (after successful transaction)
    try {
      await this.logAccess(userId, passwordId, 'DELETE')
    } catch (error) {
      // Ignore logging errors since the password is already deleted
      console.warn('Failed to log password deletion:', error)
    }
  }

  async sharePassword(userId: string, passwordId: string, shareWith: string, permissions: any): Promise<void> {
    await this.requirePasswordAccess(userId, passwordId, 'share')

    await prisma.passwordShare.upsert({
      where: {
        passwordId_sharedWith: {
          passwordId,
          sharedWith: shareWith
        }
      },
      create: {
        passwordId,
        sharedWith: shareWith,
        sharedBy: userId,
        canView: permissions.canView || false,
        canEdit: permissions.canEdit || false,
        canShare: permissions.canShare || false
      },
      update: {
        canView: permissions.canView || false,
        canEdit: permissions.canEdit || false,
        canShare: permissions.canShare || false
      }
    })

    await this.logAccess(userId, passwordId, 'SHARE')
  }

  async logAccess(userId: string, passwordId: string, action: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await prisma.vaultAccessLog.create({
      data: {
        passwordId,
        userId,
        action,
        ipAddress,
        userAgent
      }
    })
  }

  // Helper methods
  private async requireFolderAccess(userId: string, folderId: string, action: 'view' | 'edit' | 'delete' | 'share' | 'addPasswords'): Promise<void> {
    const permissions = await getUserPermissions()
    if (permissions?.isSuperAdmin) return

    const folder = await prisma.vaultFolder.findUnique({
      where: { id: folderId },
      include: { shares: true }
    })

    if (!folder) throw new Error('Folder not found')

    console.log(`Checking folder access: userId=${userId}, folder.createdBy=${folder.createdBy}, action=${action}`)
    if (folder.createdBy === userId) {
      console.log('User is folder owner - access granted')
      return
    }

    const share = folder.shares.find((s: any) => s.sharedWith === userId)
    if (!share) throw new Error('Access denied')

    const hasPermission = {
      view: share.canView,
      edit: share.canEdit,
      delete: share.canDelete,
      share: share.canShare,
      addPasswords: share.canAddPasswords
    }[action]

    if (!hasPermission) throw new Error(`Access denied for action: ${action}`)
  }

  private async requirePasswordAccess(userId: string, passwordId: string, action: 'view' | 'edit' | 'delete' | 'share'): Promise<void> {
    const permissions = await getUserPermissions()
    if (permissions?.isSuperAdmin) return

    const password = await prisma.passwordEntry.findUnique({
      where: { id: passwordId },
      include: { shares: true }
    })

    if (!password) throw new Error('Password not found')

    if (password.createdBy === userId) return

    const share = password.shares.find((s: any) => s.sharedWith === userId)
    if (!share) throw new Error('Access denied')

    const hasPermission = {
      view: share.canView,
      edit: share.canEdit,
      delete: password.createdBy === userId, // Only owner can delete
      share: share.canShare
    }[action]

    if (!hasPermission) throw new Error(`Access denied for action: ${action}`)
  }

  private mapDbFolderToVaultFolder(folder: any & {
    shares: any[];
    passwords: { id: string }[];
  }, userId: string): VaultFolder {
    const isOwner = folder.createdBy === userId
    const userShare = folder.shares.find((s: any) => s.sharedWith === userId)

    return {
      id: folder.id,
      name: folder.name,
      description: folder.description,
      color: folder.color,
      icon: folder.icon,
      parentId: folder.parentId,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
      createdBy: folder.createdBy,
      isShared: folder.shares.length > 0,
      sharedWith: folder.shares.map((s: any) => ({
        userId: s.sharedWith,
        userName: s.sharedWith, // TODO: Get actual name from user service
        userEmail: s.sharedWith,
        permissions: [
          { type: 'view', granted: s.canView },
          { type: 'edit', granted: s.canEdit },
          { type: 'share', granted: s.canShare }
        ],
        sharedAt: s.sharedAt,
        sharedBy: s.sharedBy
      })),
      permissions: {
        canView: isOwner || userShare?.canView || false,
        canEdit: isOwner || userShare?.canEdit || false,
        canDelete: isOwner || userShare?.canDelete || false,
        canShare: isOwner || userShare?.canShare || false,
        canAddPasswords: isOwner || userShare?.canAddPasswords || false
      }
    }
  }

  private mapDbPasswordToPasswordEntry(password: any): PasswordEntry {
    // Decrypt password
    let decryptedPassword = ''
    try {
      const encryptedData = encryptedDataFromString(password.encryptedPassword)
      decryptedPassword = decryptPassword(encryptedData)
    } catch (error) {
      console.error('Failed to decrypt password:', error)
      decryptedPassword = '[DECRYPTION_ERROR]'
    }

    return {
      id: password.id,
      title: password.title,
      username: password.username,
      password: decryptedPassword,
      url: password.url,
      notes: password.notes,
      category: password.category,
      folderId: password.folderId,
      createdAt: password.createdAt,
      updatedAt: password.updatedAt,
      createdBy: password.createdBy,
      lastAccessedAt: password.lastAccessedAt,
      isShared: password.shares.length > 0,
      sharedWith: password.shares.map((s: any) => ({
        userId: s.sharedWith,
        userName: s.sharedWith, // TODO: Get actual name from user service
        userEmail: s.sharedWith,
        permissions: [
          { type: 'view', granted: s.canView },
          { type: 'edit', granted: s.canEdit },
          { type: 'share', granted: s.canShare }
        ],
        sharedAt: s.sharedAt,
        sharedBy: s.sharedBy
      })),
      tags: JSON.parse(password.tags || '[]'),
      isFavorite: password.isFavorite
    }
  }
}

export const vaultService = new VaultServiceImpl()