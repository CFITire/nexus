import { NextResponse } from 'next/server'

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
    throw new Error(`Failed to get access token: ${response.statusText}`)
  }

  const data = await response.json()
  return data.access_token
}

export async function GET() {
  try {
    const accessToken = await getBCAccessToken()
    
    // Try different endpoints to see what's available
    const environment = process.env.BC_ENVIRONMENT || 'BC_Sandbox'
    const company = process.env.BC_COMPANY || 'CFI%20Tire'
    
    const endpoints = [
      `https://api.businesscentral.dynamics.com/v2.0/${process.env.BC_TENANT_ID}/${environment}/ODataV4/Company('${company}')/salesOrders`,
      `https://api.businesscentral.dynamics.com/v2.0/${process.env.BC_TENANT_ID}/${environment}/ODataV4/Company('${company}')/SalesOrder`,
      `https://api.businesscentral.dynamics.com/v2.0/${process.env.BC_TENANT_ID}/${environment}/ODataV4/Company('${company}')/$metadata`,
    ]

    const results = []

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint}`)
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })

        const status = response.status
        let data = 'No data'
        
        if (response.ok) {
          const text = await response.text()
          if (endpoint.includes('$metadata')) {
            data = text.substring(0, 1000) + '...' // Just first 1000 chars for metadata
          } else {
            data = JSON.parse(text)
          }
        } else {
          data = await response.text()
        }

        results.push({
          endpoint,
          status,
          success: response.ok,
          data
        })
      } catch (error) {
        results.push({
          endpoint,
          status: 'error',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Metadata test error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}