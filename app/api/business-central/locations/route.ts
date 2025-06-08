import { NextRequest, NextResponse } from 'next/server'

interface Location {
  code: string
  name: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
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
    
    // Try to get locations from Business Central first
    try {
      const accessToken = await getBCAccessToken()
      
      const environment = process.env.BC_ENVIRONMENT || 'BC_Sandbox'
      const company = process.env.BC_COMPANY || 'CFI%20Tire'
      
      // Use the custom Nexus_Locations endpoint
      const endpoints = [
        `https://api.businesscentral.dynamics.com/v2.0/${process.env.BC_TENANT_ID}/${environment}/ODataV4/Company('${company}')/Nexus_Locations`,
        `https://api.businesscentral.dynamics.com/v2.0/${process.env.BC_TENANT_ID}/${environment}/ODataV4/Company('${company}')/Location`
      ]
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const data = await response.json()
            const locations = data.value?.map((loc: any) => ({
              code: loc.Code || loc.code || '',
              name: loc.Name || loc.name || loc.Code || loc.code || '',
              address: loc.Address || loc.address || undefined,
              city: loc.City || loc.city || undefined,
              state: loc.State || loc.state || undefined,
              zipCode: loc.Zip_Code || loc.zipCode || undefined
            })) || []
            
            const filteredLocations = search && search.trim().length >= 1
              ? locations.filter((location: Location) => 
                  location.code.toLowerCase().includes(search.toLowerCase()) ||
                  location.name.toLowerCase().includes(search.toLowerCase())
                )
              : locations

            return NextResponse.json({ locations: filteredLocations })
          }
        } catch (err) {
          console.log(`Endpoint ${endpoint} failed:`, err)
          continue
        }
      }
    } catch (error) {
      console.warn('Business Central locations API failed:', error)
    }
    
    // Fall back to mock data when BC API fails or is disabled
    const mockLocations = [
      {
        code: "MAIN",
        name: "Main Warehouse",
        address: "123 Industrial Blvd",
        city: "Edmonton",
        state: "AB",
        zipCode: "T5J 2G3"
      },
      {
        code: "SHOP",
        name: "Service Shop",
        address: "456 Service Road",
        city: "Edmonton", 
        state: "AB",
        zipCode: "T5J 2G4"
      },
      {
        code: "YARD",
        name: "Storage Yard",
        address: "789 Storage Lane",
        city: "Edmonton",
        state: "AB", 
        zipCode: "T5J 2G5"
      },
      {
        code: "MOBILE",
        name: "Mobile Service Unit",
        address: "Various Locations",
        city: "Edmonton",
        state: "AB",
        zipCode: ""
      }
    ]
    
    const filteredLocations = search && search.trim().length >= 1
      ? mockLocations.filter(location => 
          location.code.toLowerCase().includes(search.toLowerCase()) ||
          location.name.toLowerCase().includes(search.toLowerCase())
        )
      : mockLocations
      
    return NextResponse.json({ locations: filteredLocations })
    
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}