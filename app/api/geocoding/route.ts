import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      )
    }

    // Check if address is already cached
    const cached = await prisma.geocodingCache.findUnique({
      where: { address: address.trim().toLowerCase() }
    })

    if (cached) {
      // Update usage stats
      await prisma.geocodingCache.update({
        where: { id: cached.id },
        data: {
          usageCount: { increment: 1 },
          lastUsed: new Date()
        }
      })

      return NextResponse.json({
        latitude: parseFloat(cached.latitude.toString()),
        longitude: parseFloat(cached.longitude.toString()),
        cached: true,
        source: cached.source
      })
    }

    // If not cached, geocode using Azure Maps
    const azureMapsKey = process.env.NEXT_PUBLIC_AZURE_MAPS_KEY
    if (!azureMapsKey) {
      return NextResponse.json(
        { error: 'Azure Maps key not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(
      `https://atlas.microsoft.com/search/address/json?subscription-key=${azureMapsKey}&api-version=1.0&query=${encodeURIComponent(address)}&countrySet=US,CA`
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Geocoding failed' },
        { status: 500 }
      )
    }

    const data = await response.json()
    
    if (!data.results || data.results.length === 0) {
      return NextResponse.json(
        { error: 'No results found for address' },
        { status: 404 }
      )
    }

    const result = data.results[0]
    const latitude = result.position.lat
    const longitude = result.position.lon

    // Cache the result
    await prisma.geocodingCache.create({
      data: {
        address: address.trim().toLowerCase(),
        latitude: latitude,
        longitude: longitude,
        country: result.address?.country || null,
        city: result.address?.municipality || result.address?.localName || null,
        source: 'azure_maps',
        usageCount: 1,
        lastUsed: new Date()
      }
    })

    return NextResponse.json({
      latitude,
      longitude,
      cached: false,
      source: 'azure_maps'
    })

  } catch (error) {
    console.error('Geocoding API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Batch geocoding endpoint for multiple addresses
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { addresses } = body

    if (!addresses || !Array.isArray(addresses)) {
      return NextResponse.json(
        { error: 'Addresses array is required' },
        { status: 400 }
      )
    }

    const results = []
    const azureMapsKey = process.env.NEXT_PUBLIC_AZURE_MAPS_KEY

    for (const address of addresses) {
      const normalizedAddress = address.trim().toLowerCase()
      
      // Check cache first
      let cached = await prisma.geocodingCache.findUnique({
        where: { address: normalizedAddress }
      })

      if (cached) {
        // Update usage stats
        await prisma.geocodingCache.update({
          where: { id: cached.id },
          data: {
            usageCount: { increment: 1 },
            lastUsed: new Date()
          }
        })

        results.push({
          address,
          latitude: parseFloat(cached.latitude.toString()),
          longitude: parseFloat(cached.longitude.toString()),
          cached: true,
          source: cached.source
        })
        continue
      }

      // Geocode if not cached
      if (!azureMapsKey) {
        results.push({
          address,
          error: 'Azure Maps key not configured'
        })
        continue
      }

      try {
        const response = await fetch(
          `https://atlas.microsoft.com/search/address/json?subscription-key=${azureMapsKey}&api-version=1.0&query=${encodeURIComponent(address)}&countrySet=US,CA`
        )

        if (response.ok) {
          const data = await response.json()
          
          if (data.results && data.results.length > 0) {
            const result = data.results[0]
            const latitude = result.position.lat
            const longitude = result.position.lon

            // Cache the result
            await prisma.geocodingCache.create({
              data: {
                address: normalizedAddress,
                latitude: latitude,
                longitude: longitude,
                country: result.address?.country || null,
                city: result.address?.municipality || result.address?.localName || null,
                source: 'azure_maps',
                usageCount: 1,
                lastUsed: new Date()
              }
            })

            results.push({
              address,
              latitude,
              longitude,
              cached: false,
              source: 'azure_maps'
            })
          } else {
            results.push({
              address,
              error: 'No results found'
            })
          }
        } else {
          results.push({
            address,
            error: 'Geocoding request failed'
          })
        }
      } catch (error) {
        console.error('Geocoding error for address:', address, error)
        results.push({
          address,
          error: 'Geocoding failed'
        })
      }

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return NextResponse.json({ results })

  } catch (error) {
    console.error('Batch geocoding API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}