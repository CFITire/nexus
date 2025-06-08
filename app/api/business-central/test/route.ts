import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const tokenUrl = `https://login.microsoftonline.com/${process.env.BC_TENANT_ID}/oauth2/v2.0/token`
    
    const params = new URLSearchParams({
      client_id: process.env.BC_CLIENT_ID!,
      client_secret: process.env.BC_CLIENT_SECRET!,
      scope: 'https://api.businesscentral.dynamics.com/.default',
      grant_type: 'client_credentials'
    })

    console.log('Testing BC connection...')
    console.log('Token URL:', tokenUrl)
    console.log('Client ID:', process.env.BC_CLIENT_ID)
    console.log('Tenant ID:', process.env.BC_TENANT_ID)
    console.log('Base URL:', process.env.BC_BASE_URL)
    console.log('API URL would be:', `https://api.businesscentral.dynamics.com/v2.0/${process.env.BC_TENANT_ID}/BC_Sandbox/ODataV4/Company('CFI%20Tire')/SalesOrder`)

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    })

    const responseText = await response.text()
    console.log('Token response status:', response.status)
    console.log('Token response:', responseText)

    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Failed to get token',
        status: response.status,
        response: responseText
      }, { status: 500 })
    }

    const tokenData = JSON.parse(responseText)
    return NextResponse.json({ 
      success: true,
      hasToken: !!tokenData.access_token,
      tokenLength: tokenData.access_token?.length || 0
    })
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 })
  }
}