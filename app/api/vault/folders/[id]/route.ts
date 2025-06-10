import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireModuleAccess } from '@/lib/rbac'
import { vaultService } from '@/lib/vault'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireModuleAccess('vault')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const folder = await vaultService.updateFolder(session.user.email, params.id, data)
    
    return NextResponse.json(folder)

  } catch (error) {
    console.error('Error updating folder:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update folder', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireModuleAccess('vault')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await vaultService.deleteFolder(session.user.email, params.id)
    
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting folder:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete folder', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}