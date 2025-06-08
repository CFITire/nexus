import { NextRequest, NextResponse } from 'next/server'

interface SalesOrder {
  number: string
  customerName: string
  orderDate: string
  status: string
  salespersonCode: string
}

interface BCTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

async function getBCAccessToken(): Promise<string> {
  const tokenUrl = `https://login.microsoftonline.com/${process.env.BC_TENANT_ID}/oauth2/v2.0/token`
  
  const params = new URLSearchParams({
    client_id: process.env.BC_CLIENT_ID!,
    client_secret: process.env.BC_CLIENT_SECRET!,
    scope: 'https://api.businesscentral.dynamics.com/.default',
    grant_type: 'client_credentials'
  })

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString()
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Token request failed:', errorText)
    throw new Error(`Failed to get access token: ${response.statusText}`)
  }

  const data: BCTokenResponse = await response.json()
  return data.access_token
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    
    // Don't return any results if no search term provided
    if (!search || search.trim().length < 2) {
      return NextResponse.json({ salesOrders: [] })
    }
    
    // Get access token
    const accessToken = await getBCAccessToken()
    
    // Use correct endpoint with proper case - BC_Sandbox works, bc-sandbox gives auth errors
    const apiUrl = `https://api.businesscentral.dynamics.com/v2.0/${process.env.BC_TENANT_ID}/BC_Sandbox/ODataV4/Company('CFI%20Tire')/SalesOrder`
    
    let allSalesOrders: SalesOrder[] = []
    
    // Since BC doesn't support OR between different fields, we need to make separate queries
    console.log('Searching SO by number and customer name separately...')
    
    // Search by SO number - use startswith for more precise number matching
    const numberFilterQuery = `?$filter=startswith(No,'${search}')`
    console.log('Fetching SO by number from URL:', `${apiUrl}${numberFilterQuery}`)
    
    const numberResponse = await fetch(`${apiUrl}${numberFilterQuery}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (numberResponse.ok) {
      const numberData = await numberResponse.json()
      const numberOrders = numberData.value?.map((order: any) => ({
        number: order.No || '',
        customerName: order.Sell_to_Customer_Name || '',
        orderDate: order.Order_Date || '',
        status: order.Status || '',
        salespersonCode: order.Salesperson_Code || ''
      })) || []
      allSalesOrders.push(...numberOrders)
    }

    // Search by customer name
    const customerFilterQuery = `?$filter=contains(Sell_to_Customer_Name,'${search}')`
    console.log('Fetching SO by customer from URL:', `${apiUrl}${customerFilterQuery}`)
    
    const customerResponse = await fetch(`${apiUrl}${customerFilterQuery}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (customerResponse.ok) {
      const customerData = await customerResponse.json()
      const customerOrders = customerData.value?.map((order: any) => ({
        number: order.No || '',
        customerName: order.Sell_to_Customer_Name || '',
        orderDate: order.Order_Date || '',
        status: order.Status || '',
        salespersonCode: order.Salesperson_Code || ''
      })) || []
      
      // Merge results and remove duplicates based on SO number
      customerOrders.forEach((order: SalesOrder) => {
        if (!allSalesOrders.find((existing: SalesOrder) => existing.number === order.number)) {
          allSalesOrders.push(order)
        }
      })
    }

    return NextResponse.json({ salesOrders: allSalesOrders })
  } catch (error) {
    console.error('Error fetching sales orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales orders' },
      { status: 500 }
    )
  }
}