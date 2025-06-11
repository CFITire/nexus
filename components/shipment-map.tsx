'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Truck, Clock, MapPin, Package } from 'lucide-react'

interface Shipment {
  shipmentNo: string
  shipmentDate: string
  salesOrderNo: string
  customerName: string
  destinationAddress: string
  destinationLatitude?: number
  destinationLongitude?: number
  estimatedDeliveryDate?: string
  actualDeliveryDate?: string
  status: string
  trackingNumber: string
  carrierCode: string
  totalWeight?: number
  totalValue?: number
  // Additional BC fields
  serviceCode?: string
  shipmentMethod?: string
  salespersonCode?: string
  responsibilityCenter?: string
  orderDate?: string
  dueDate?: string
  requestedDeliveryDate?: string
  promisedDeliveryDate?: string
}

interface ShipmentMapProps {
  shipments: Shipment[]
  selectedDate: string | { from: Date, to: Date }
}

function ShipmentMapComponent({ shipments, selectedDate }: ShipmentMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [atlas, setAtlas] = useState<any>(null)
  const [geocodedShipments, setGeocodedShipments] = useState<Shipment[]>([])
  const [isGeocoding, setIsGeocoding] = useState(false)


  useEffect(() => {
    // Check if we have a valid Azure Maps key
    const azureMapsKey = process.env.NEXT_PUBLIC_AZURE_MAPS_KEY
    
    if (!azureMapsKey || azureMapsKey === 'your_azure_maps_subscription_key_here' || azureMapsKey === 'your-azure-maps-key') {
      console.warn('Azure Maps key not configured. Map will show placeholder.')
      return
    }

    // Dynamically import Azure Maps only on client side
    import('azure-maps-control').then((atlasModule) => {
      setAtlas(atlasModule)
    }).catch((error) => {
      console.error('Failed to load Azure Maps:', error)
    })
  }, [])

  // Geocode addresses to get coordinates
  useEffect(() => {
    if (!atlas || !shipments.length) return

    const geocodeShipments = async () => {
      setIsGeocoding(true)

      const geocoded = []
      
      // Collect all addresses that need geocoding
      const addressesToGeocode = []
      const shipmentAddressMap = new Map()
      
      for (const shipment of shipments) {
        if (shipment.destinationLatitude && shipment.destinationLongitude) {
          // Already has coordinates
          geocoded.push(shipment)
        } else if (shipment.destinationAddress) {
          const normalizedAddress = shipment.destinationAddress.trim()
          if (!shipmentAddressMap.has(normalizedAddress)) {
            addressesToGeocode.push(normalizedAddress)
            shipmentAddressMap.set(normalizedAddress, [])
          }
          shipmentAddressMap.get(normalizedAddress).push(shipment)
        } else {
          // No address, use default location
          geocoded.push({
            ...shipment,
            destinationLatitude: 53.5461, // Edmonton default
            destinationLongitude: -113.4909
          })
        }
      }

      if (addressesToGeocode.length > 0) {
        
        try {
          // Use batch geocoding API with cache
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
          
          const response = await fetch('/api/geocoding', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ addresses: addressesToGeocode }),
            signal: controller.signal
          })
          
          clearTimeout(timeoutId)

          if (response.ok) {
            const data = await response.json()
            
            // Process results and update shipments
            data.results.forEach((result: any) => {
              const shipmentsForAddress = shipmentAddressMap.get(result.address.trim())
              if (shipmentsForAddress) {
                shipmentsForAddress.forEach((shipment: any) => {
                  if (result.latitude && result.longitude) {
                    geocoded.push({
                      ...shipment,
                      destinationLatitude: result.latitude,
                      destinationLongitude: result.longitude
                    })
                  } else {
                    // Geocoding failed, use default location
                    console.warn('Geocoding failed for:', result.address, result.error)
                    geocoded.push({
                      ...shipment,
                      destinationLatitude: 53.5461, // Edmonton default
                      destinationLongitude: -113.4909
                    })
                  }
                })
              }
            })
          } else {
            console.error('Batch geocoding failed:', response.status)
            // Fallback: add all remaining shipments with default coordinates
            shipmentAddressMap.forEach((shipments) => {
              shipments.forEach((shipment: any) => {
                geocoded.push({
                  ...shipment,
                  destinationLatitude: 53.5461,
                  destinationLongitude: -113.4909
                })
              })
            })
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.warn('Geocoding request timed out, using default coordinates')
          } else {
            console.error('Geocoding API error:', error)
          }
          // Fallback: add all remaining shipments with default coordinates
          shipmentAddressMap.forEach((shipments) => {
            shipments.forEach((shipment: any) => {
              geocoded.push({
                ...shipment,
                destinationLatitude: 53.5461,
                destinationLongitude: -113.4909
              })
            })
          })
        }
      }
      
      setGeocodedShipments(geocoded)
      setIsGeocoding(false)
    }

    geocodeShipments()
  }, [shipments, atlas])

  useEffect(() => {
    if (!mapRef.current || !atlas) {
      return
    }

    const azureMapsKey = process.env.NEXT_PUBLIC_AZURE_MAPS_KEY
    if (!azureMapsKey || azureMapsKey === 'your_azure_maps_subscription_key_here' || azureMapsKey === 'your-azure-maps-key') {
      return
    }
    
    // Initialize map with US center or shipment center
    const hasShipments = geocodedShipments.length > 0
    const defaultCenter = [-98.5795, 39.8283] // Geographic center of US
    const defaultZoom = hasShipments ? 5 : 4
    
    map.current = new atlas.Map(mapRef.current, {
      center: hasShipments ? [-113.4909, 53.5461] : defaultCenter,
      zoom: defaultZoom,
      style: 'road',
      authOptions: {
        authType: atlas.AuthenticationType.subscriptionKey,
        subscriptionKey: azureMapsKey
      },
      // Disable accessibility announcements
      enableAccessibility: false
    })

    map.current.events.add('ready', () => {
      if (!map.current) return

      // Add data source
      const dataSource = new atlas.source.DataSource()
      map.current.sources.add(dataSource)

      // Add shipment markers only for those with coordinates
      const markersToAdd = geocodedShipments.filter(shipment => shipment.destinationLatitude && shipment.destinationLongitude)
      
      markersToAdd.forEach((shipment) => {
        const point = new atlas.data.Feature(
          new atlas.data.Point([shipment.destinationLongitude!, shipment.destinationLatitude!]),
          {
            shipmentNo: shipment.shipmentNo,
            customerName: shipment.customerName,
            status: shipment.status,
            estimatedDelivery: shipment.estimatedDeliveryDate || '',
            actualDelivery: shipment.actualDeliveryDate || '',
            trackingNumber: shipment.trackingNumber,
            carrierCode: shipment.carrierCode,
            totalValue: shipment.totalValue || 0,
            destinationAddress: shipment.destinationAddress
          }
        )
        dataSource.add(point)
      })

      // Create symbol layer
      const symbolLayer = new atlas.layer.SymbolLayer(dataSource, undefined, {
        iconOptions: {
          image: 'pin-red',
          anchor: 'center',
          allowOverlap: true,
          size: 0.8
        },
        textOptions: {
          textField: ['get', 'customerName'],
          color: '#000000',
          offset: [0, -2],
          size: 12
        }
      })

      map.current.layers.add(symbolLayer)

      // Add click event for markers
      map.current.events.add('click', symbolLayer, (e: any) => {
        if (e.shapes && e.shapes.length > 0) {
          const shape = e.shapes[0] as any
          const shipmentNo = shape.properties.shipmentNo
          const shipment = geocodedShipments.find(s => s.shipmentNo === shipmentNo)
          if (shipment) {
            setSelectedShipment(shipment)
          }
        }
      })

      // Center map on shipments with coordinates, or default to US view
      const shipmentsWithCoords = geocodedShipments.filter(s => s.destinationLatitude && s.destinationLongitude)
      if (shipmentsWithCoords.length > 0) {
        // Create bounding box from all shipment coordinates
        const coordinates = shipmentsWithCoords.map(shipment => [
          shipment.destinationLongitude!, 
          shipment.destinationLatitude!
        ])
        
        const bounds = atlas.data.BoundingBox.fromPositions(coordinates)
        
        map.current.setCamera({
          bounds: bounds,
          padding: 50
        })
      } else {
        // No shipments - show US map
        map.current.setCamera({
          center: [-98.5795, 39.8283], // Geographic center of US
          zoom: 4
        })
      }
    })

    return () => {
      if (map.current) {
        map.current.dispose()
      }
    }
  }, [geocodedShipments, atlas])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'in transit':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'delayed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Shipments for {typeof selectedDate === 'string' 
            ? new Date(selectedDate).toLocaleDateString()
            : `${selectedDate.from.toLocaleDateString()} - ${selectedDate.to.toLocaleDateString()}`
          }
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Package className="h-4 w-4" />
          {shipments.length} shipments
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              {atlas ? (
                <div className="relative">
                  <div 
                    ref={mapRef} 
                    className="w-full h-[500px] rounded-lg"
                    style={{ minHeight: '500px' }}
                  />
                  {isGeocoding && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                      <div className="text-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-sm text-muted-foreground">Geocoding addresses...</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-[500px] rounded-lg flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 border-2 border-dashed border-blue-200">
                  <div className="text-center space-y-4 p-8">
                    <MapPin className="h-16 w-16 text-blue-400 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">Azure Maps Integration</h3>
                      <p className="text-sm text-gray-600 mt-2 max-w-md">
                        To enable the interactive map, add your Azure Maps subscription key to the environment variables.
                      </p>
                    </div>
                    <div className="bg-white/80 rounded-lg p-4 border border-blue-200">
                      <p className="text-xs font-mono text-gray-500">
                        NEXT_PUBLIC_AZURE_MAPS_KEY=your_key_here
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">Shipment locations would appear here:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {(geocodedShipments.length > 0 ? geocodedShipments : shipments).slice(0, 3).map((shipment, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {shipment.customerName} - {shipment.status}
                          </Badge>
                        ))}
                        {shipments.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{shipments.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Shipment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Shipments</span>
                <span className="font-semibold">{shipments.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">In Transit</span>
                <span className="font-semibold text-blue-600">
                  {shipments.filter(s => s.status === 'In Transit').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Delivered</span>
                <span className="font-semibold text-green-600">
                  {shipments.filter(s => s.status === 'Delivered').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Value</span>
                <span className="font-semibold">
                  ${shipments.reduce((sum, s) => sum + (s.totalValue || 0), 0).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {selectedShipment && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  {selectedShipment.shipmentNo}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium">{selectedShipment.customerName}</div>
                  <div className="text-xs text-muted-foreground">{selectedShipment.destinationAddress}</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(selectedShipment.status)}>
                    {selectedShipment.status}
                  </Badge>
                  <Badge variant="outline">{selectedShipment.carrierCode}</Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sales Order:</span>
                    <span>{selectedShipment.salesOrderNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tracking:</span>
                    <span className="font-mono text-xs">{selectedShipment.trackingNumber}</span>
                  </div>
                  {selectedShipment.estimatedDeliveryDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. Delivery:</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(selectedShipment.estimatedDeliveryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {selectedShipment.actualDeliveryDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivered:</span>
                      <span>{new Date(selectedShipment.actualDeliveryDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedShipment.dueDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span>{new Date(selectedShipment.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedShipment.totalValue && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Value:</span>
                      <span>${selectedShipment.totalValue.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedShipment.totalWeight && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weight:</span>
                      <span>{selectedShipment.totalWeight.toLocaleString()} kg</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// Export the component with dynamic import to prevent SSR issues
export const ShipmentMap = dynamic(() => Promise.resolve(ShipmentMapComponent), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-lg flex items-center justify-center bg-muted">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  )
})