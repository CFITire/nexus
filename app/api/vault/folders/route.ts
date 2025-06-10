import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireModuleAccess } from '@/lib/rbac'
import { vaultService } from '@/lib/vault'

export async function GET(request: NextRequest) {
  try {
    await requireModuleAccess('vault')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const folders = await vaultService.getFolders(session.user.email)
    return NextResponse.json(folders)

  } catch (error) {
    console.error('Error fetching folders:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch folders', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireModuleAccess('vault')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const folder = await vaultService.createFolder(session.user.email, data)
    
    return NextResponse.json(folder, { status: 201 })

  } catch (error) {
    console.error('Error creating folder:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create folder', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}