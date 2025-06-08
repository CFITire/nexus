import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    console.log('=== Session Test Debug ===')
    console.log('Environment:', {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '[SET]' : '[NOT SET]',
      NODE_ENV: process.env.NODE_ENV
    })

    const session = await getServerSession(authOptions)
    
    console.log('Session result:', {
      hasSession: !!session,
      sessionKeys: session ? Object.keys(session) : [],
      userExists: !!session?.user,
      userKeys: session?.user ? Object.keys(session.user) : [],
      accessTokenExists: !!(session as any)?.accessToken
    })

    if (!session) {
      return NextResponse.json({
        error: 'No session found',
        debug: {
          message: 'getServerSession returned null/undefined',
          suggestion: 'Check if user is signed in and cookies are being sent'
        }
      }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      hasSession: true,
      hasUser: !!session.user,
      hasAccessToken: !!(session as any)?.accessToken,
      userEmail: session.user?.email,
      userName: session.user?.name
    })

  } catch (error) {
    console.error('Session test error:', error)
    return NextResponse.json({
      error: 'Session test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}