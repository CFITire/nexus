import { NextRequest, NextResponse } from 'next/server'

interface PurchaseOrder {
  number: string
  vendorName: string
  documentDate: string
  status: string
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
      return NextResponse.json({ purchaseOrders: [] })
    }
    
    // Get access token
    const accessToken = await getBCAccessToken()
    
    // Use correct endpoint for Purchase Orders
    const apiUrl = `https://api.businesscentral.dynamics.com/v2.0/${process.env.BC_TENANT_ID}/BC_Sandbox/ODataV4/Company('CFI%20Tire')/PurchaseOrders`
    
    let allPurchaseOrders: PurchaseOrder[] = []
    
    // Since BC doesn't support OR between different fields, we need to make separate queries
    console.log('Searching PO by number and vendor name separately...')
    
    // Search by PO number - use startswith for more precise number matching
    const numberFilterQuery = `?$filter=startswith(No,'${search}')`
    console.log('Fetching PO by number from URL:', `${apiUrl}${numberFilterQuery}`)
    
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
        vendorName: order.Buy_from_Vendor_Name || '',
        documentDate: order.Document_Date || '',
        status: order.Status || ''
      })) || []
      allPurchaseOrders.push(...numberOrders)
    }

    // Search by vendor name
    const vendorFilterQuery = `?$filter=contains(Buy_from_Vendor_Name,'${search}')`
    console.log('Fetching PO by vendor from URL:', `${apiUrl}${vendorFilterQuery}`)
    
    const vendorResponse = await fetch(`${apiUrl}${vendorFilterQuery}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (vendorResponse.ok) {
      const vendorData = await vendorResponse.json()
      const vendorOrders = vendorData.value?.map((order: any) => ({
        number: order.No || '',
        vendorName: order.Buy_from_Vendor_Name || '',
        documentDate: order.Document_Date || '',
        status: order.Status || ''
      })) || []
      
      // Merge results and remove duplicates based on PO number
      vendorOrders.forEach((order: PurchaseOrder) => {
        if (!allPurchaseOrders.find((existing: PurchaseOrder) => existing.number === order.number)) {
          allPurchaseOrders.push(order)
        }
      })
    }

    return NextResponse.json({ purchaseOrders: allPurchaseOrders })
  } catch (error) {
    console.error('Error fetching purchase orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchase orders' },
      { status: 500 }
    )
  }
}