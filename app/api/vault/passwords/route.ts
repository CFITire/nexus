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

    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folderId')

    const passwords = await vaultService.getPasswords(
      session.user.email, 
      folderId || undefined
    )
    
    return NextResponse.json(passwords)

  } catch (error) {
    console.error('Error fetching passwords:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch passwords', 
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
    console.log('Creating password for user:', session.user.email)
    console.log('Password data:', data)
    
    // Get IP and User Agent for logging
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const password = await vaultService.createPassword(session.user.email, data)
    
    return NextResponse.json(password, { status: 201 })

  } catch (error) {
    console.error('Error creating password:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create password', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}