import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface SessionWithToken {
  accessToken?: string
  [key: string]: unknown
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const sessionWithToken = session as SessionWithToken | null
    
    return NextResponse.json({
      hasSession: !!session,
      sessionKeys: session ? Object.keys(session) : [],
      hasUser: !!session?.user,
      userKeys: session?.user ? Object.keys(session.user) : [],
      hasAccessToken: !!sessionWithToken?.accessToken,
      tokenExists: sessionWithToken?.accessToken ? 'yes' : 'no',
      // Don't log actual token for security
      session: session ? {
        ...session,
        accessToken: sessionWithToken?.accessToken ? '[REDACTED]' : undefined
      } : null
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to get session',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}