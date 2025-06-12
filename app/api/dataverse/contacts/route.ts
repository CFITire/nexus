import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasModuleAccess } from '@/lib/rbac'
import { dvClient, formatContactForDisplay } from '@/lib/dataverse'

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
    const select = searchParams.get('select') || 'contactid,fullname,firstname,lastname,emailaddress1,telephone1,jobtitle,parentcustomerid,statuscode'

    const response = await dvClient.getContacts(filter || undefined, select)
    
    const formattedContacts = response.value.map(formatContactForDisplay)

    return NextResponse.json({
      contacts: formattedContacts,
      count: response['@odata.count'] || formattedContacts.length
    })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
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

    const contactData = await request.json()
    const result = await dvClient.createContact(contactData)

    return NextResponse.json({ success: true, id: result.id })
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
  }
}