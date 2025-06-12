import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasModuleAccess } from '@/lib/rbac'
import { dvClient, formatAccountForDisplay } from '@/lib/dataverse'

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
    const select = searchParams.get('select') || 'accountid,name,accountnumber,telephone1,emailaddress1,address1_city,address1_stateorprovince,address1_country,statuscode'

    const response = await dvClient.getAccounts(filter || undefined, select)
    
    const formattedAccounts = response.value.map(formatAccountForDisplay)

    return NextResponse.json({
      accounts: formattedAccounts,
      count: response['@odata.count'] || formattedAccounts.length
    })
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
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

    const accountData = await request.json()
    const result = await dvClient.createAccount(accountData)

    return NextResponse.json({ success: true, id: result.id })
  } catch (error) {
    console.error('Error creating account:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}