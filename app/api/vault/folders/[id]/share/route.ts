import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireModuleAccess } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireModuleAccess('vault')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sharedWith } = await request.json()
    const folderId = params.id

    // Check if user has permission to share this folder
    const folder = await prisma.vaultFolder.findUnique({
      where: { id: folderId },
      include: { shares: true }
    })

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    }

    if (folder.createdBy !== session.user.email) {
      // Check if user has share permission
      const userShare = folder.shares.find(s => s.sharedWith === session.user.email && s.canShare)
      if (!userShare) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Delete existing shares for this folder
    await prisma.vaultFolderShare.deleteMany({
      where: { folderId }
    })

    // Create new shares
    for (const share of sharedWith) {
      await prisma.vaultFolderShare.create({
        data: {
          folderId,
          sharedWith: share.userEmail,
          sharedBy: session.user.email,
          canView: share.permissions.find((p: any) => p.type === 'view')?.granted || false,
          canEdit: share.permissions.find((p: any) => p.type === 'edit')?.granted || false,
          canDelete: share.permissions.find((p: any) => p.type === 'delete')?.granted || false,
          canShare: share.permissions.find((p: any) => p.type === 'share')?.granted || false,
          canAddPasswords: share.permissions.find((p: any) => p.type === 'addPasswords')?.granted || false,
        }
      })
    }

    // Return updated folder with shares
    const updatedFolder = await prisma.vaultFolder.findUnique({
      where: { id: folderId },
      include: {
        shares: true,
        passwords: { select: { id: true } }
      }
    })

    return NextResponse.json(updatedFolder)

  } catch (error) {
    console.error('Error sharing folder:', error)
    return NextResponse.json(
      { 
        error: 'Failed to share folder', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}