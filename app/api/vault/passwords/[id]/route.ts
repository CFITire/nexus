import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireModuleAccess } from '@/lib/rbac'
import { vaultService } from '@/lib/vault'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireModuleAccess('vault')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get IP and User Agent for logging
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent')

    const { id } = await params
    const password = await vaultService.getPassword(session.user.email, id)
    
    // Log access is handled in the service
    
    return NextResponse.json(password)

  } catch (error) {
    console.error('Error fetching password:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch password', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireModuleAccess('vault')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { id } = await params
    const password = await vaultService.updatePassword(session.user.email, id, data)
    
    return NextResponse.json(password)

  } catch (error) {
    console.error('Error updating password:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update password', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireModuleAccess('vault')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await vaultService.deletePassword(session.user.email, id)
    
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting password:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete password', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}