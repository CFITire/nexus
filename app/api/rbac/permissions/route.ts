import { NextResponse } from 'next/server'
import { getUserPermissions } from '@/lib/rbac'

export async function GET() {
  try {
    const permissions = await getUserPermissions()
    
    if (!permissions) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(permissions)
  } catch (error) {
    console.error('Error getting permissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}