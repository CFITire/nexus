import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasModuleAccess } from '@/lib/rbac'
import { dvClient } from '@/lib/dataverse'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!(await hasModuleAccess('crm'))) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Test basic connectivity to Dataverse
    const testResults = {
      timestamp: new Date().toISOString(),
      user: session.user?.email,
      tests: [] as any[]
    }

    try {
      // Test accounts endpoint
      const accounts = await dvClient.getAccounts(undefined, 'accountid,name')
      testResults.tests.push({
        endpoint: 'accounts',
        status: 'success',
        count: accounts.value?.length || 0
      })
    } catch (error) {
      testResults.tests.push({
        endpoint: 'accounts',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    try {
      // Test contacts endpoint
      const contacts = await dvClient.getContacts(undefined, 'contactid,fullname')
      testResults.tests.push({
        endpoint: 'contacts',
        status: 'success',
        count: contacts.value?.length || 0
      })
    } catch (error) {
      testResults.tests.push({
        endpoint: 'contacts',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    try {
      // Test opportunities endpoint
      const opportunities = await dvClient.getOpportunities(undefined, 'opportunityid,name')
      testResults.tests.push({
        endpoint: 'opportunities',
        status: 'success',
        count: opportunities.value?.length || 0
      })
    } catch (error) {
      testResults.tests.push({
        endpoint: 'opportunities',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    const successCount = testResults.tests.filter(t => t.status === 'success').length
    const totalCount = testResults.tests.length

    return NextResponse.json({
      ...testResults,
      summary: {
        passed: successCount,
        total: totalCount,
        success: successCount === totalCount
      }
    })
  } catch (error) {
    console.error('Error running Dataverse tests:', error)
    return NextResponse.json({ 
      error: 'Failed to run Dataverse tests',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}