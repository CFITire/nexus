import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/lib/rbac'

// Type assertion to help with Prisma client recognition
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

// Start impersonation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if user has admin permissions using RBAC
    const userPermissions = await getUserPermissions()
    
    if (!userPermissions || !userPermissions.isSuperAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get or create current user for session tracking
    const currentUser = await db.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name || session.user.email.split('@')[0]
      }
    })

    const { targetUserEmail } = await request.json()

    if (!targetUserEmail) {
      return NextResponse.json({ error: 'Target user email required' }, { status: 400 })
    }

    // Get or create target user
    const targetUser = await db.user.upsert({
      where: { email: targetUserEmail },
      update: {},
      create: {
        email: targetUserEmail,
        name: targetUserEmail.split('@')[0] // Use email prefix as default name
      }
    })

    // Create impersonation session record
    const impersonationSession = await db.impersonationSession.create({
      data: {
        adminUserId: currentUser.id,
        targetUserId: targetUser.id,
        startedAt: new Date(),
        isActive: true,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      impersonationId: impersonationSession.id,
      targetUser: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        groups: targetUser.groups
      }
    })

  } catch (error) {
    console.error('Impersonation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// End impersonation
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const impersonationId = searchParams.get('id')

    if (!impersonationId) {
      return NextResponse.json({ error: 'Impersonation ID required' }, { status: 400 })
    }

    // End the impersonation session
    await db.impersonationSession.update({
      where: { id: impersonationId },
      data: {
        endedAt: new Date(),
        isActive: false
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('End impersonation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get current impersonation status or validate session
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session')

    // If session ID provided, validate that specific session
    if (sessionId) {
      const impersonationSession = await db.impersonationSession.findFirst({
        where: {
          id: sessionId,
          isActive: true
        },
        include: {
          targetUser: true
        }
      })

      if (impersonationSession) {
        return NextResponse.json({
          isValid: true,
          targetUser: {
            id: impersonationSession.targetUser.id,
            name: impersonationSession.targetUser.name,
            email: impersonationSession.targetUser.email
          }
        })
      } else {
        return NextResponse.json({
          isValid: false
        })
      }
    }

    // Otherwise, check for admin's active impersonation sessions
    const currentUser = await db.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name || session.user.email.split('@')[0]
      }
    })

    // Check for active impersonation sessions
    const activeImpersonation = await db.impersonationSession.findFirst({
      where: {
        adminUserId: currentUser.id,
        isActive: true
      },
      include: {
        targetUser: true
      }
    })

    return NextResponse.json({
      isImpersonating: !!activeImpersonation,
      impersonation: activeImpersonation ? {
        id: activeImpersonation.id,
        targetUser: activeImpersonation.targetUser,
        startedAt: activeImpersonation.startedAt
      } : null
    })

  } catch (error) {
    console.error('Get impersonation status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}