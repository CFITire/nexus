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

interface CachedToken {
  token: string
  expiresAt: number
}

let tokenCache: CachedToken | null = null

async function getBCAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token
  }

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
  
  // Cache the token with 5 minute buffer before expiry
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000
  }
  
  return data.access_token
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    
    // Skip Business Central API call only if explicitly disabled
    if (process.env.BC_DISABLE_API === 'true') {
      const mockOrders = [
        {
          number: "SO001234",
          customerName: "ABC Construction", 
          orderDate: "2024-06-08",
          status: "Open",
          salespersonCode: "JOHN"
        },
        {
          number: "SO001235",
          customerName: "XYZ Mining Corp",
          orderDate: "2024-06-07", 
          status: "Released",
          salespersonCode: "JANE"
        }
      ]
      
      const filteredOrders = search && search.trim().length >= 2
        ? mockOrders.filter(order => 
            order.number.toLowerCase().includes(search.toLowerCase()) ||
            order.customerName.toLowerCase().includes(search.toLowerCase())
          )
        : (search ? [] : mockOrders)
        
      return NextResponse.json({ salesOrders: filteredOrders })
    }
    
    // Don't return any results if no search term provided
    if (!search || search.trim().length < 2) {
      return NextResponse.json({ salesOrders: [] })
    }
    
    // Get access token
    const accessToken = await getBCAccessToken()
    
    // Use environment variables for flexible configuration
    const environment = process.env.BC_ENVIRONMENT || 'BC_Sandbox'
    const company = process.env.BC_COMPANY || 'CFI%20Tire'
    const apiUrl = `https://api.businesscentral.dynamics.com/v2.0/${process.env.BC_TENANT_ID}/${environment}/ODataV4/Company('${company}')/SalesOrder`
    
    // Since BC doesn't support OR between different fields, we need to make separate queries
    console.log('Searching SO by number and customer name in parallel...')
    
    // Create both queries with limits and ordering for faster response (newest first)
    const numberFilterQuery = `?$filter=startswith(No,'${search}')&$top=50&$orderby=Order_Date desc`
    const customerFilterQuery = `?$filter=contains(Sell_to_Customer_Name,'${search}')&$top=50&$orderby=Order_Date desc`
    
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }

    // Run both queries in parallel
    const [numberResponse, customerResponse] = await Promise.all([
      fetch(`${apiUrl}${numberFilterQuery}`, { headers }),
      fetch(`${apiUrl}${customerFilterQuery}`, { headers })
    ])

    let allSalesOrders: SalesOrder[] = []

    // Process number search results
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

    // Process customer search results and merge, avoiding duplicates
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

    // Sort by relevance: exact matches first, then by order date (newest first)
    allSalesOrders.sort((a, b) => {
      const aExact = a.number.toLowerCase() === search.toLowerCase()
      const bExact = b.number.toLowerCase() === search.toLowerCase()
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      
      // Sort by date descending (newest first)
      const dateA = new Date(a.orderDate || 0).getTime()
      const dateB = new Date(b.orderDate || 0).getTime()
      return dateB - dateA
    })

    return NextResponse.json({ salesOrders: allSalesOrders })
  } catch (error) {
    console.error('Error fetching sales orders:', error)
    
    // Fall back to mock data only if BC API is disabled
    if (process.env.BC_DISABLE_API === 'true') {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get('search') || ''
      
      const mockOrders = [
        {
          number: "SO001234",
          customerName: "ABC Construction",
          orderDate: "2024-06-08",
          status: "Open",
          salespersonCode: "JOHN"
        },
        {
          number: "SO001235", 
          customerName: "XYZ Mining Corp",
          orderDate: "2024-06-07",
          status: "Released",
          salespersonCode: "JANE"
        }
      ]
      
      const filteredOrders = search 
        ? mockOrders.filter(order => 
            order.number.toLowerCase().includes(search.toLowerCase()) ||
            order.customerName.toLowerCase().includes(search.toLowerCase())
          )
        : mockOrders
        
      return NextResponse.json({ salesOrders: filteredOrders })
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch sales orders' },
      { status: 500 }
    )
  }
}