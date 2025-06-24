import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { freepbxClient } from '@/lib/freepbx'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    switch (type) {
      case 'extensions':
        const extensions = await freepbxClient.getExtensions()
        return NextResponse.json({ extensions })

      case 'call-logs':
        const startDate = searchParams.get('startDate') || undefined
        const endDate = searchParams.get('endDate') || undefined
        const limit = parseInt(searchParams.get('limit') || '100')
        
        const callLogs = await freepbxClient.getCallLogs(startDate, endDate, limit)
        return NextResponse.json({ callLogs })

      case 'queues':
        const queues = await freepbxClient.getQueues()
        return NextResponse.json({ queues })

      case 'device-status':
        const deviceStatus = await freepbxClient.getDeviceStatus()
        return NextResponse.json({ deviceStatus })

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Communications API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch communications data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'originate-call':
        const { from, to, context } = body
        const result = await freepbxClient.originateCall(from, to, context)
        return NextResponse.json({ success: true, result })

      case 'hangup-call':
        const { channel } = body
        await freepbxClient.hangupCall(channel)
        return NextResponse.json({ success: true })

      case 'transfer-call':
        const { transferChannel, extension } = body
        await freepbxClient.transferCall(transferChannel, extension)
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Communications API error:', error)
    return NextResponse.json(
      { error: 'Failed to perform communications action' },
      { status: 500 }
    )
  }
}