import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      hasSession: !!session,
      sessionKeys: session ? Object.keys(session) : [],
      hasUser: !!session?.user,
      userKeys: session?.user ? Object.keys(session.user) : [],
      hasAccessToken: !!(session as any)?.accessToken,
      tokenExists: (session as any)?.accessToken ? 'yes' : 'no',
      // Don't log actual token for security
      session: session ? {
        ...session,
        accessToken: (session as any)?.accessToken ? '[REDACTED]' : undefined
      } : null
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to get session',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}