import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasModuleAccess } from '@/lib/rbac'
import { dvClient, formatOpportunityForDisplay } from '@/lib/dataverse'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!(await hasModuleAccess('crm'))) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter')
    const select = searchParams.get('select') || 'opportunityid,name,estimatedvalue,closeprobability,estimatedclosedate,stepname,parentaccountid,parentcontactid,statuscode'

    const response = await dvClient.getOpportunities(filter || undefined, select)
    
    const formattedOpportunities = response.value.map(formatOpportunityForDisplay)

    return NextResponse.json({
      opportunities: formattedOpportunities,
      count: response['@odata.count'] || formattedOpportunities.length
    })
  } catch (error) {
    console.error('Error fetching opportunities:', error)
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!(await hasModuleAccess('crm'))) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const opportunityData = await request.json()
    const result = await dvClient.createOpportunity(opportunityData)

    return NextResponse.json({ success: true, id: result.id })
  } catch (error) {
    console.error('Error creating opportunity:', error)
    return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 })
  }
}