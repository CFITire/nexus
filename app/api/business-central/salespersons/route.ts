import { NextRequest, NextResponse } from 'next/server'

interface Salesperson {
  code: string
  name: string
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
      return NextResponse.json({ salespersons: [] })
    }
    
    // Get access token
    const accessToken = await getBCAccessToken()
    
    // Get unique salespersons from Sales Orders
    const apiUrl = `https://api.businesscentral.dynamics.com/v2.0/${process.env.BC_TENANT_ID}/BC_Sandbox/ODataV4/Company('CFI%20Tire')/SalesOrder`
    
    // Search for sales orders to get salesperson data
    const filterQuery = `?$filter=contains(Salesperson_Code,'${search}')&$select=Salesperson_Code`
    console.log('Fetching Salespersons from URL:', `${apiUrl}${filterQuery}`)
    
    const response = await fetch(`${apiUrl}${filterQuery}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('BC API error response:', errorBody)
      throw new Error(`BC API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Extract unique salesperson codes and create salesperson objects
    const salespersonCodes = new Set<string>()
    data.value?.forEach((order: any) => {
      if (order.Salesperson_Code && order.Salesperson_Code.trim()) {
        salespersonCodes.add(order.Salesperson_Code.trim())
      }
    })

    // Convert to salesperson objects - for now using code as both code and name
    // In the future, you could fetch from a dedicated Salesperson API if available
    const salespersons: Salesperson[] = Array.from(salespersonCodes)
      .filter(code => code.toLowerCase().includes(search.toLowerCase()))
      .map(code => ({
        code: code,
        name: code // Using code as name for now - could be enhanced with actual names
      }))
      .sort((a, b) => a.code.localeCompare(b.code))

    return NextResponse.json({ salespersons })
  } catch (error) {
    console.error('Error fetching salespersons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch salespersons' },
      { status: 500 }
    )
  }
}