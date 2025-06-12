"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { IconRoute, IconMapPin, IconNavigation, IconRefresh, IconPlus, IconRobot, IconFilter, IconUsers, IconBuilding, IconClock, IconTarget } from "@tabler/icons-react"

interface Customer {
  id: string
  name: string
  city: string
  state: string
  address: string
  latitude: number
  longitude: number
  priority: 'high' | 'medium' | 'low'
  channel: 'direct' | 'dealer' | 'distributor' | 'online'
  segment: 'enterprise' | 'mid-market' | 'small-business'
  territory: 'north' | 'south' | 'central' | 'west' | 'east'
  lastVisit: string
  nextVisitDue: string
  revenue: number
  contactPerson: string
  phone: string
  status: 'active' | 'inactive' | 'prospect'
  visitFrequency: 'weekly' | 'monthly' | 'quarterly'
  aiScore: number
  aiReason: string
  accountValue: number
  daysSinceLastVisit: number
  preferredVisitTime: 'morning' | 'afternoon' | 'evening'
  riskLevel: 'low' | 'medium' | 'high'
  opportunityScore: number
  isVisible?: boolean
  isSelected?: boolean
}

interface MapPin {
  id: string
  latitude: number
  longitude: number
  type: 'customer' | 'custom' | 'waypoint'
  customerId?: string
  label?: string
  note?: string
}

interface Route {
  id: string
  name: string
  customers: Customer[]
  totalDistance: number
  estimatedTime: string
  date: string
  status: 'planned' | 'active' | 'completed'
}

export function CrmMappingContent() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([])
  const [isAddToRouteOpen, setIsAddToRouteOpen] = useState(false)
  const [filterMethod, setFilterMethod] = useState<string>("all")
  const [selectedChannel, setSelectedChannel] = useState<string>("all")
  const [selectedSegment, setSelectedSegment] = useState<string>("all")
  const [maxDistance, setMaxDistance] = useState<string>("50")
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [optimizedRoute, setOptimizedRoute] = useState<Customer[]>([])
  
  // Map state
  const [mapPins, setMapPins] = useState<MapPin[]>([])
  const [mapFilters, setMapFilters] = useState({
    channel: 'all',
    segment: 'all', 
    territory: 'all',
    status: 'all',
    riskLevel: 'all',
    priority: 'all'
  })
  const [selectedMapCustomers, setSelectedMapCustomers] = useState<string[]>([])
  const [savedSelections, setSavedSelections] = useState<{id: string, name: string, customers: string[], pins: MapPin[]}[]>([])
  
  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const optimizeRoute = () => {
    if (selectedCustomers.length < 2) return

    const customersToOptimize = customers.filter(c => selectedCustomers.includes(c.id))
    
    // Enhanced route optimization with time windows and priority scoring
    const startLocation = { latitude: 29.7604, longitude: -95.3698, name: "CFI Headquarters" } // Houston, TX
    const optimized = []
    const remaining = [...customersToOptimize]

    // Sort by priority first (high-value customers, overdue visits)
    remaining.sort((a, b) => {
      const priorityA = (a.accountValue > 100000 ? 3 : 0) + (a.daysSinceLastVisit > 30 ? 2 : 0) + (a.aiScore / 20)
      const priorityB = (b.accountValue > 100000 ? 3 : 0) + (b.daysSinceLastVisit > 30 ? 2 : 0) + (b.aiScore / 20)
      return priorityB - priorityA
    })

    let currentLocation = startLocation

    while (remaining.length > 0) {
      let bestCustomer = remaining[0]
      let bestScore = 0

      remaining.forEach(customer => {
        const distance = calculateDistance(currentLocation.latitude, currentLocation.longitude, customer.latitude, customer.longitude)
        const timeWindow = customer.preferredVisitTime === "morning" ? 1.2 : customer.preferredVisitTime === "afternoon" ? 1.0 : 0.8
        const urgency = customer.daysSinceLastVisit > 30 ? 1.5 : 1.0
        const value = customer.accountValue > 100000 ? 1.3 : 1.0
        
        // Score: lower distance is better, but weighted by business factors
        const score = (1 / (distance + 1)) * timeWindow * urgency * value * (customer.aiScore / 100)
        
        if (score > bestScore) {
          bestScore = score
          bestCustomer = customer
        }
      })

      optimized.push(bestCustomer)
      currentLocation = bestCustomer
      remaining.splice(remaining.indexOf(bestCustomer), 1)
    }

    setOptimizedRoute(optimized)
    // Update selected customers order to match optimized route
    setSelectedCustomers(optimized.map(c => c.id))
  }

  useEffect(() => {
    // Mock customer data
    setCustomers([
      {
        id: "1",
        name: "Acme Corporation",
        city: "Edmonton",
        state: "Alberta",
        address: "123 Industrial Blvd, Edmonton, AB",
        latitude: 53.5461,
        longitude: -113.4938,
        priority: "high",
        channel: "direct",
        segment: "enterprise",
        territory: "central",
        lastVisit: "2024-05-15",
        nextVisitDue: "2024-06-15",
        revenue: 450000,
        contactPerson: "John Smith",
        phone: "(780) 555-0123",
        status: "active",
        visitFrequency: "monthly",
        aiScore: 92,
        aiReason: "High revenue customer, contract renewal due next month",
        accountValue: 450000,
        daysSinceLastVisit: 28,
        preferredVisitTime: "morning",
        riskLevel: "low",
        opportunityScore: 85
      },
      {
        id: "2", 
        name: "Beta Industries",
        city: "Calgary",
        state: "Alberta",
        address: "456 Commerce Way, Calgary, AB",
        latitude: 51.0447,
        longitude: -114.0719,
        priority: "medium",
        channel: "dealer",
        segment: "mid-market",
        territory: "south",
        lastVisit: "2024-04-20",
        nextVisitDue: "2024-07-20",
        revenue: 125000,
        contactPerson: "Sarah Johnson",
        phone: "(403) 555-0456",
        status: "active",
        visitFrequency: "quarterly",
        aiScore: 78,
        aiReason: "Recent order increase, good relationship building opportunity",
        accountValue: 125000,
        daysSinceLastVisit: 52,
        preferredVisitTime: "afternoon",
        riskLevel: "medium",
        opportunityScore: 72
      },
      {
        id: "3",
        name: "Gamma Solutions",
        city: "Red Deer",
        state: "Alberta", 
        address: "789 Supply Chain Dr, Red Deer, AB",
        latitude: 52.2681,
        longitude: -113.8112,
        priority: "high",
        channel: "distributor",
        segment: "enterprise",
        territory: "central",
        lastVisit: "2024-03-10",
        nextVisitDue: "2024-06-10",
        revenue: 320000,
        contactPerson: "Mike Wilson",
        phone: "(403) 555-0789",
        status: "active",
        visitFrequency: "monthly",
        aiScore: 88,
        aiReason: "Overdue for visit, potential for fleet expansion",
        accountValue: 320000,
        daysSinceLastVisit: 87,
        preferredVisitTime: "morning",
        riskLevel: "high",
        opportunityScore: 91
      },
      {
        id: "4",
        name: "Delta Manufacturing",
        city: "Lethbridge", 
        state: "Alberta",
        address: "321 Factory Row, Lethbridge, AB",
        latitude: 49.6938,
        longitude: -112.8451,
        priority: "medium",
        channel: "direct",
        segment: "mid-market",
        territory: "south",
        lastVisit: "2024-05-01",
        nextVisitDue: "2024-08-01",
        revenue: 85000,
        contactPerson: "Lisa Chen",
        phone: "(403) 555-0321",
        status: "prospect",
        visitFrequency: "quarterly",
        aiScore: 65,
        aiReason: "New prospect, initial meeting scheduled",
        accountValue: 85000,
        daysSinceLastVisit: 0,
        preferredVisitTime: "afternoon",
        riskLevel: "medium",
        opportunityScore: 68
      },
      {
        id: "5",
        name: "Northern Logistics",
        city: "Fort McMurray",
        state: "Alberta",
        address: "555 Transport Ave, Fort McMurray, AB", 
        latitude: 56.7267,
        longitude: -111.3790,
        priority: "high",
        channel: "direct",
        segment: "enterprise",
        territory: "north",
        lastVisit: "2024-02-28",
        nextVisitDue: "2024-05-28",
        revenue: 680000,
        contactPerson: "Robert Kim",
        phone: "(780) 555-0555",
        status: "active",
        visitFrequency: "monthly",
        aiScore: 95,
        aiReason: "Highest revenue customer, relationship maintenance critical",
        accountValue: 680000,
        daysSinceLastVisit: 101,
        preferredVisitTime: "morning",
        riskLevel: "high",
        opportunityScore: 98
      }
    ])

    // Mock existing routes
    setRoutes([
      {
        id: "1",
        name: "Central Alberta Route",
        customers: [],
        totalDistance: 0,
        estimatedTime: "0h 0m",
        date: "2024-06-15",
        status: "planned"
      }
    ])
  }, [])

  const filterCustomers = () => {
    let filtered = customers

    if (filterMethod === "channel" && selectedChannel !== "all") {
      filtered = filtered.filter(c => c.channel === selectedChannel)
    }
    
    if (filterMethod === "segment" && selectedSegment !== "all") {
      filtered = filtered.filter(c => c.segment === selectedSegment)
    }
    
    if (filterMethod === "distance") {
      // Mock distance filtering (in real app, calculate from route starting point)
      const maxDistanceKm = parseInt(maxDistance)
      filtered = filtered.filter(c => {
        // Mock distance calculation
        const mockDistance = Math.abs(c.latitude - 53.5461) * 111 // Rough km conversion
        return mockDistance <= maxDistanceKm
      })
    }
    
    if (filterMethod === "ai") {
      // Enhanced AI filtering with multiple criteria
      filtered = filtered.filter(c => {
        const hasHighScore = c.aiScore >= 75
        const isOverdue = c.daysSinceLastVisit > 30
        const hasHighValue = c.accountValue > 100000
        const hasHighRisk = c.riskLevel === "high"
        const hasHighOpportunity = c.opportunityScore > 70
        
        // Include if meets any of these criteria
        return hasHighScore || isOverdue || hasHighValue || hasHighRisk || hasHighOpportunity
      })
      
      // Sort by combined AI score and business impact
      filtered.sort((a, b) => {
        const scoreA = a.aiScore + (a.daysSinceLastVisit > 30 ? 15 : 0) + (a.accountValue > 200000 ? 10 : 0) + (a.riskLevel === "high" ? 12 : 0)
        const scoreB = b.aiScore + (b.daysSinceLastVisit > 30 ? 15 : 0) + (b.accountValue > 200000 ? 10 : 0) + (b.riskLevel === "high" ? 12 : 0)
        return scoreB - scoreA
      })
    }

    if (filterMethod === "overdue") {
      filtered = filtered.filter(c => new Date(c.nextVisitDue) < new Date())
    }

    setAvailableCustomers(filtered)
  }

  useEffect(() => {
    filterCustomers()
  }, [filterMethod, selectedChannel, selectedSegment, maxDistance, customers])

  const addCustomersToRoute = () => {
    if (!selectedRoute || selectedCustomers.length === 0) return

    const customersToAdd = customers.filter(c => selectedCustomers.includes(c.id))
    const updatedRoute = {
      ...selectedRoute,
      customers: [...selectedRoute.customers, ...customersToAdd],
      totalDistance: selectedRoute.totalDistance + (customersToAdd.length * 25), // Mock calculation
      estimatedTime: `${Math.floor((selectedRoute.customers.length + customersToAdd.length) * 1.5)}h ${((selectedRoute.customers.length + customersToAdd.length) * 30) % 60}m`
    }

    setRoutes(routes.map(r => r.id === selectedRoute.id ? updatedRoute : r))
    setSelectedRoute(updatedRoute)
    setSelectedCustomers([])
    setIsAddToRouteOpen(false)
  }

  const generateAiRecommendations = () => {
    setFilterMethod("ai")
    // AI recommendations already filtered in useEffect
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'direct': return 'bg-blue-100 text-blue-800'
      case 'dealer': return 'bg-green-100 text-green-800'
      case 'distributor': return 'bg-purple-100 text-purple-800'
      case 'online': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'enterprise': return 'bg-purple-100 text-purple-800'
      case 'mid-market': return 'bg-blue-100 text-blue-800'
      case 'small-business': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Map filtering functions
  const applyMapFilters = () => {
    return customers.map(customer => ({
      ...customer,
      isVisible: (
        (mapFilters.channel === 'all' || customer.channel === mapFilters.channel) &&
        (mapFilters.segment === 'all' || customer.segment === mapFilters.segment) &&
        (mapFilters.territory === 'all' || customer.territory === mapFilters.territory) &&
        (mapFilters.status === 'all' || customer.status === mapFilters.status) &&
        (mapFilters.riskLevel === 'all' || customer.riskLevel === mapFilters.riskLevel) &&
        (mapFilters.priority === 'all' || customer.priority === mapFilters.priority)
      ),
      isSelected: selectedMapCustomers.includes(customer.id)
    }))
  }

  const addCustomPin = (lat: number, lng: number, label: string = 'Custom Pin') => {
    const newPin: MapPin = {
      id: Date.now().toString(),
      latitude: lat,
      longitude: lng,
      type: 'custom',
      label
    }
    setMapPins([...mapPins, newPin])
  }

  const saveCurrentSelection = (name: string) => {
    const newSelection = {
      id: Date.now().toString(),
      name,
      customers: selectedMapCustomers,
      pins: mapPins.filter(pin => pin.type === 'custom')
    }
    setSavedSelections([...savedSelections, newSelection])
  }

  const generateRouteFromMap = () => {
    const selectedCustomersData = customers.filter(c => selectedMapCustomers.includes(c.id))
    // Update the route planning tab with selected customers
    if (selectedRoute) {
      const updatedRoute = {
        ...selectedRoute,
        customers: [...selectedRoute.customers, ...selectedCustomersData]
      }
      setRoutes(routes.map(r => r.id === selectedRoute.id ? updatedRoute : r))
      setSelectedRoute(updatedRoute)
    }
  }

  const getTerritoryColor = (territory: string) => {
    switch (territory) {
      case 'north': return 'bg-blue-100 text-blue-800'
      case 'south': return 'bg-red-100 text-red-800' 
      case 'central': return 'bg-green-100 text-green-800'
      case 'west': return 'bg-purple-100 text-purple-800'
      case 'east': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredMapCustomers = applyMapFilters()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Mapping & Route Planning</h3>
          <p className="text-sm text-muted-foreground">
            Interactive mapping, route planning, and customer relationship management
          </p>
        </div>
      </div>

      <Tabs defaultValue="route-planning" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="route-planning">Route Planning</TabsTrigger>
          <TabsTrigger value="maps">Interactive Maps</TabsTrigger>
        </TabsList>
        
        <TabsContent value="route-planning" className="space-y-6">
          {/* Route Management Header */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-md font-semibold">Route Planning</h4>
              <p className="text-sm text-muted-foreground">
                Create and manage customer visit routes with intelligent recommendations
              </p>
            </div>
        <Dialog open={isAddToRouteOpen} onOpenChange={setIsAddToRouteOpen}>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className="h-4 w-4 mr-2" />
              Add Customers to Route
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Customers to Route</DialogTitle>
              <DialogDescription>
                Select customers using different criteria and add them to your route
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Filter Methods */}
              <div className="flex gap-2 flex-wrap">
                <Button 
                  size="sm" 
                  variant={filterMethod === "all" ? "default" : "outline"}
                  onClick={() => setFilterMethod("all")}
                >
                  <IconUsers className="h-4 w-4 mr-1" />
                  All Customers
                </Button>
                <Button 
                  size="sm" 
                  variant={filterMethod === "channel" ? "default" : "outline"}
                  onClick={() => setFilterMethod("channel")}
                >
                  <IconBuilding className="h-4 w-4 mr-1" />
                  By Channel
                </Button>
                <Button 
                  size="sm" 
                  variant={filterMethod === "segment" ? "default" : "outline"}
                  onClick={() => setFilterMethod("segment")}
                >
                  <IconTarget className="h-4 w-4 mr-1" />
                  By Segment
                </Button>
                <Button 
                  size="sm" 
                  variant={filterMethod === "distance" ? "default" : "outline"}
                  onClick={() => setFilterMethod("distance")}
                >
                  <IconMapPin className="h-4 w-4 mr-1" />
                  By Distance
                </Button>
                <Button 
                  size="sm" 
                  variant={filterMethod === "ai" ? "default" : "outline"}
                  onClick={generateAiRecommendations}
                >
                  <IconRobot className="h-4 w-4 mr-1" />
                  AI Recommended
                </Button>
                <Button 
                  size="sm" 
                  variant={filterMethod === "overdue" ? "default" : "outline"}
                  onClick={() => setFilterMethod("overdue")}
                >
                  <IconClock className="h-4 w-4 mr-1" />
                  Overdue Visits
                </Button>
              </div>

              {/* Filter Options */}
              {filterMethod === "channel" && (
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Channel:</Label>
                  <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Channels</SelectItem>
                      <SelectItem value="direct">Direct</SelectItem>
                      <SelectItem value="dealer">Dealer</SelectItem>
                      <SelectItem value="distributor">Distributor</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {filterMethod === "segment" && (
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Segment:</Label>
                  <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Segments</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="mid-market">Mid-Market</SelectItem>
                      <SelectItem value="small-business">Small Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {filterMethod === "distance" && (
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Max Distance:</Label>
                  <Input 
                    type="number" 
                    value={maxDistance} 
                    onChange={(e) => setMaxDistance(e.target.value)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">km</span>
                </div>
              )}

              {/* Customer List */}
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                <div className="p-4 space-y-3">
                  {availableCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={customer.id}
                        checked={selectedCustomers.includes(customer.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCustomers([...selectedCustomers, customer.id])
                          } else {
                            setSelectedCustomers(selectedCustomers.filter(id => id !== customer.id))
                          }
                        }}
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{customer.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {customer.address}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getChannelColor(customer.channel)}>
                              {customer.channel}
                            </Badge>
                            <Badge className={getSegmentColor(customer.segment)}>
                              {customer.segment}
                            </Badge>
                            {filterMethod === "ai" && (
                              <Badge className="bg-green-100 text-green-800">
                                AI: {customer.aiScore}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Contact:</span>
                            <p className="font-medium">{customer.contactPerson}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Account Value:</span>
                            <p className="font-medium">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "CAD",
                                notation: "compact"
                              }).format(customer.accountValue)}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Risk Level:</span>
                            <p className={`font-medium ${
                              customer.riskLevel === "high" ? "text-red-600" : 
                              customer.riskLevel === "medium" ? "text-yellow-600" : "text-green-600"
                            }`}>
                              {customer.riskLevel.charAt(0).toUpperCase() + customer.riskLevel.slice(1)}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Last Visit:</span>
                            <p className="font-medium">{customer.lastVisit} ({customer.daysSinceLastVisit}d ago)</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Next Due:</span>
                            <p className="font-medium">{customer.nextVisitDue}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Preferred Time:</span>
                            <p className="font-medium">{customer.preferredVisitTime}</p>
                          </div>
                        </div>

                        {filterMethod === "ai" && (
                          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg text-sm border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-blue-800">AI Recommendations</span>
                              <div className="flex gap-1">
                                <Badge className="bg-blue-100 text-blue-800 text-xs">
                                  Score: {customer.aiScore}
                                </Badge>
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  Opportunity: {customer.opportunityScore}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-blue-700 mb-2">{customer.aiReason}</p>
                            <div className="flex gap-2 text-xs">
                              {customer.daysSinceLastVisit > 30 && (
                                <Badge className="bg-red-100 text-red-700">Overdue Visit</Badge>
                              )}
                              {customer.accountValue > 200000 && (
                                <Badge className="bg-purple-100 text-purple-700">High Value</Badge>
                              )}
                              {customer.riskLevel === "high" && (
                                <Badge className="bg-orange-100 text-orange-700">At Risk</Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {availableCustomers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <IconUsers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No customers found with the selected criteria</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddToRouteOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addCustomersToRoute} disabled={selectedCustomers.length === 0}>
                Add {selectedCustomers.length} Customer{selectedCustomers.length !== 1 ? 's' : ''} to Route
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Routes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconRoute className="h-5 w-5" />
              Current Routes
            </CardTitle>
            <CardDescription>
              Select a route to add customers to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {routes.map((route) => (
                <div 
                  key={route.id} 
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedRoute?.id === route.id ? 'border-primary bg-primary/5' : 'hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedRoute(route)}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{route.name}</h4>
                    <Badge variant="outline">{route.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {route.customers.length} customers • {route.totalDistance}km • {route.estimatedTime}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Scheduled: {route.date}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconMapPin className="h-5 w-5" />
              Route Details
            </CardTitle>
            <CardDescription>
              {selectedRoute ? `Details for ${selectedRoute.name}` : 'Select a route to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedRoute ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Distance:</span>
                    <p className="font-medium">{selectedRoute.totalDistance}km</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estimated Time:</span>
                    <p className="font-medium">{selectedRoute.estimatedTime}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Customers:</span>
                    <p className="font-medium">{selectedRoute.customers.length}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <p className="font-medium">{selectedRoute.date}</p>
                  </div>
                </div>

                {selectedRoute.customers.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">Customers on Route:</h5>
                      {optimizedRoute.length > 0 && (
                        <Badge className="bg-green-100 text-green-800">
                          Optimized
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedRoute.customers.map((customer, index) => {
                        const isOptimized = optimizedRoute.length > 0
                        const estimatedDistance = index > 0 ? 
                          calculateDistance(
                            selectedRoute.customers[index-1].latitude,
                            selectedRoute.customers[index-1].longitude,
                            customer.latitude,
                            customer.longitude
                          ).toFixed(1) : '0'
                        
                        return (
                          <div key={customer.id} className="flex items-center gap-2 p-2 border rounded text-sm">
                            <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{customer.name}</p>
                                {customer.riskLevel === "high" && (
                                  <Badge className="bg-red-100 text-red-700 text-xs">High Risk</Badge>
                                )}
                                {customer.daysSinceLastVisit > 30 && (
                                  <Badge className="bg-orange-100 text-orange-700 text-xs">Overdue</Badge>
                                )}
                              </div>
                              <p className="text-muted-foreground">{customer.city} • {customer.preferredVisitTime}</p>
                              {isOptimized && index > 0 && (
                                <p className="text-xs text-blue-600">+{estimatedDistance}km from previous</p>
                              )}
                            </div>
                            <div className="text-right">
                              <Badge className={getChannelColor(customer.channel)}>
                                {customer.channel}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                AI: {customer.aiScore}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    
                    {optimizedRoute.length > 0 && (
                      <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                        <p className="text-sm text-green-800 font-medium">Route Optimization Summary:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-green-700 mt-1">
                          <div>High-priority customers first</div>
                          <div>Optimized by distance & time windows</div>
                          <div>Account value weighted</div>
                          <div>Risk factors considered</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={optimizeRoute}
                    disabled={selectedRoute.customers.length < 2}
                  >
                    <IconNavigation className="h-4 w-4 mr-1" />
                    Optimize Route
                  </Button>
                  <Button size="sm" variant="outline">
                    Export to GPS
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <IconRoute className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Select a route to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TabsContent>

    <TabsContent value="maps" className="space-y-6">
      {/* Maps Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-md font-semibold">Interactive Maps</h4>
          <p className="text-sm text-muted-foreground">
            View customers on map, drop pins, and generate routes from selections
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <IconMapPin className="h-4 w-4 mr-2" />
                Saved Selections ({savedSelections.length})
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Saved Map Selections</DialogTitle>
                <DialogDescription>
                  Your previously saved customer selections and custom pins
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {savedSelections.map((selection) => (
                  <div key={selection.id} className="border rounded p-3">
                    <h5 className="font-medium">{selection.name}</h5>
                    <p className="text-sm text-muted-foreground">
                      {selection.customers.length} customers, {selection.pins.length} custom pins
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => {
                        setSelectedMapCustomers(selection.customers)
                        setMapPins(selection.pins)
                      }}
                    >
                      Load Selection
                    </Button>
                  </div>
                ))}
                {savedSelections.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No saved selections</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <Button 
            onClick={generateRouteFromMap}
            disabled={selectedMapCustomers.length === 0}
          >
            <IconRoute className="h-4 w-4 mr-2" />
            Generate Route from Selection
          </Button>
        </div>
      </div>

      {/* Map Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconFilter className="h-5 w-5" />
            Map Filters
          </CardTitle>
          <CardDescription>Filter customers shown on the map</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <Label className="text-sm font-medium">Channel</Label>
              <Select value={mapFilters.channel} onValueChange={(value) => setMapFilters({...mapFilters, channel: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="direct">Direct</SelectItem>
                  <SelectItem value="dealer">Dealer</SelectItem>
                  <SelectItem value="distributor">Distributor</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Segment</Label>
              <Select value={mapFilters.segment} onValueChange={(value) => setMapFilters({...mapFilters, segment: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Segments</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="mid-market">Mid-Market</SelectItem>
                  <SelectItem value="small-business">Small Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Territory</Label>
              <Select value={mapFilters.territory} onValueChange={(value) => setMapFilters({...mapFilters, territory: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Territories</SelectItem>
                  <SelectItem value="north">North</SelectItem>
                  <SelectItem value="south">South</SelectItem>
                  <SelectItem value="central">Central</SelectItem>
                  <SelectItem value="west">West</SelectItem>
                  <SelectItem value="east">East</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Select value={mapFilters.status} onValueChange={(value) => setMapFilters({...mapFilters, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Risk Level</Label>
              <Select value={mapFilters.riskLevel} onValueChange={(value) => setMapFilters({...mapFilters, riskLevel: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Priority</Label>
              <Select value={mapFilters.priority} onValueChange={(value) => setMapFilters({...mapFilters, priority: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredMapCustomers.filter(c => c.isVisible).length} of {filteredMapCustomers.length} customers
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setMapFilters({
                  channel: 'all',
                  segment: 'all',
                  territory: 'all',
                  status: 'all',
                  riskLevel: 'all',
                  priority: 'all'
                })}
              >
                Clear Filters
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" disabled={selectedMapCustomers.length === 0}>
                    Save Selection ({selectedMapCustomers.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Map Selection</DialogTitle>
                    <DialogDescription>
                      Save your current customer selection and custom pins for later use
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="selection-name">Selection Name</Label>
                      <Input 
                        id="selection-name" 
                        placeholder="Enter a name for this selection"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement
                            if (input.value.trim()) {
                              saveCurrentSelection(input.value.trim())
                              input.value = ''
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => {
                      const input = document.getElementById('selection-name') as HTMLInputElement
                      if (input?.value.trim()) {
                        saveCurrentSelection(input.value.trim())
                        input.value = ''
                      }
                    }}>
                      Save Selection
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map and Customer List */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Mock Map Container */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconMapPin className="h-5 w-5" />
              Interactive Map
            </CardTitle>
            <CardDescription>
              Click on customers to select them, click empty areas to drop custom pins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              ref={mapRef}
              className="h-96 bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 border-2 border-slate-300 rounded-lg relative overflow-hidden cursor-crosshair"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 40%),
                  radial-gradient(circle at 80% 70%, rgba(34, 197, 94, 0.1) 0%, transparent 40%),
                  linear-gradient(135deg, 
                    rgba(148, 163, 184, 0.1) 0%, 
                    rgba(203, 213, 225, 0.1) 25%, 
                    rgba(241, 245, 249, 0.1) 50%, 
                    rgba(226, 232, 240, 0.1) 75%, 
                    rgba(148, 163, 184, 0.1) 100%
                  )
                `,
                backgroundSize: '100% 100%, 100% 100%, 100% 100%'
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = e.clientX - rect.left
                const y = e.clientY - rect.top
                const lat = 53.0 + (y / rect.height) * 6 // Mock latitude range
                const lng = -120.0 + (x / rect.width) * 15 // Mock longitude range
                addCustomPin(lat, lng, `Pin ${mapPins.length + 1}`)
              }}
            >
              {/* Map Grid Lines */}
              <div className="absolute inset-0">
                {/* Vertical grid lines */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={`v-${i}`}
                    className="absolute top-0 bottom-0 w-px bg-slate-200 opacity-30"
                    style={{ left: `${(i + 1) * 12.5}%` }}
                  />
                ))}
                {/* Horizontal grid lines */}
                {[...Array(6)].map((_, i) => (
                  <div
                    key={`h-${i}`}
                    className="absolute left-0 right-0 h-px bg-slate-200 opacity-30"
                    style={{ top: `${(i + 1) * 16.66}%` }}
                  />
                ))}
              </div>

              {/* Map Labels */}
              <div className="absolute top-2 left-2 text-xs text-slate-600 font-medium bg-white/80 px-2 py-1 rounded">
                Alberta Region
              </div>
              <div className="absolute top-2 right-2 text-xs text-slate-600 bg-white/80 px-2 py-1 rounded">
                Interactive Map View
              </div>
              <div className="absolute bottom-2 left-2 text-xs text-slate-500 bg-white/80 px-2 py-1 rounded">
                Lat: 49°-59° | Lng: -120°--105°
              </div>

              {/* Territory Regions */}
              <div className="absolute top-4 left-1/4 text-xs text-blue-600 font-semibold opacity-60">NORTH</div>
              <div className="absolute top-1/2 left-1/4 text-xs text-green-600 font-semibold opacity-60">CENTRAL</div>
              <div className="absolute bottom-4 left-1/4 text-xs text-red-600 font-semibold opacity-60">SOUTH</div>
              <div className="absolute top-1/3 left-12 text-xs text-purple-600 font-semibold opacity-60">WEST</div>
              <div className="absolute top-1/3 right-12 text-xs text-orange-600 font-semibold opacity-60">EAST</div>

              <div className="absolute inset-0 p-4">
                {/* Mock customer markers */}
                {filteredMapCustomers.filter(c => c.isVisible).map((customer) => {
                  const x = ((customer.longitude + 120) / 15) * 100
                  const y = ((customer.latitude - 53) / 6) * 100
                  return (
                    <div
                      key={customer.id}
                      className={`absolute w-8 h-8 rounded-full border-3 border-white shadow-xl cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 z-10 ${
                        customer.isSelected ? 'bg-blue-600 ring-4 ring-blue-200' : 
                        customer.priority === 'high' ? 'bg-red-500 hover:bg-red-600' :
                        customer.priority === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
                      }`}
                      style={{ left: `${Math.max(5, Math.min(95, x))}%`, top: `${Math.max(5, Math.min(95, y))}%` }}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (selectedMapCustomers.includes(customer.id)) {
                          setSelectedMapCustomers(selectedMapCustomers.filter(id => id !== customer.id))
                        } else {
                          setSelectedMapCustomers([...selectedMapCustomers, customer.id])
                        }
                      }}
                      title={`${customer.name} - ${customer.city}`}
                    >
                      {/* Customer marker icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      
                      {/* Selection indicator */}
                      {customer.isSelected && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        </div>
                      )}
                      
                      {/* High risk indicator */}
                      {customer.riskLevel === 'high' && (
                        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-orange-500 rounded-full border border-white"></div>
                      )}
                    </div>
                  )
                })}

                {/* Custom pins */}
                {mapPins.map((pin) => (
                  <div
                    key={pin.id}
                    className="absolute w-6 h-8 transform -translate-x-1/2 -translate-y-full cursor-pointer hover:scale-110 transition-all z-20"
                    style={{ 
                      left: `${((pin.longitude + 120) / 15) * 100}%`, 
                      top: `${((pin.latitude - 53) / 6) * 100}%` 
                    }}
                    title={pin.label}
                  >
                    {/* Pin body */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                      <div className="w-6 h-6 bg-purple-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                        <IconMapPin className="h-3 w-3 text-white" />
                      </div>
                      {/* Pin point */}
                      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-purple-600"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Legend */}
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-slate-200">
                <h6 className="text-xs font-semibold text-slate-700 mb-2">Map Legend</h6>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full border border-white shadow-sm"></div>
                    <span className="text-slate-600">High Priority</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full border border-white shadow-sm"></div>
                    <span className="text-slate-600">Medium Priority</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full border border-white shadow-sm"></div>
                    <span className="text-slate-600">Low Priority</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded-full border border-white shadow-sm ring-2 ring-blue-200"></div>
                    <span className="text-slate-600">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-600 rounded-full border border-white shadow-sm"></div>
                    <span className="text-slate-600">Custom Pin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full border border-white"></div>
                    <span className="text-slate-600">High Risk</span>
                  </div>
                </div>
              </div>

              {/* Instructions overlay (only when no customers visible) */}
              {filteredMapCustomers.filter(c => c.isVisible).length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                  <div className="text-center text-slate-600">
                    <IconMapPin className="h-16 w-16 mx-auto mb-3 opacity-40" />
                    <p className="text-lg font-medium mb-2">No customers to display</p>
                    <p className="text-sm">Adjust your filters to see customers on the map</p>
                    <p className="text-xs mt-1 text-slate-500">Click empty areas to drop custom pins</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Selected: {selectedMapCustomers.length} customers, {mapPins.length} custom pins
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setSelectedMapCustomers([])
                  setMapPins([])
                }}
                disabled={selectedMapCustomers.length === 0 && mapPins.length === 0}
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customer List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUsers className="h-5 w-5" />
              Filtered Customers
            </CardTitle>
            <CardDescription>
              Customers matching your filter criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredMapCustomers.filter(c => c.isVisible).map((customer) => (
                <div 
                  key={customer.id} 
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    customer.isSelected ? 'border-primary bg-primary/5' : 'hover:border-gray-300'
                  }`}
                  onClick={() => {
                    if (selectedMapCustomers.includes(customer.id)) {
                      setSelectedMapCustomers(selectedMapCustomers.filter(id => id !== customer.id))
                    } else {
                      setSelectedMapCustomers([...selectedMapCustomers, customer.id])
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{customer.name}</h5>
                    <div className="flex gap-1">
                      <Badge className={getChannelColor(customer.channel)} variant="outline">
                        {customer.channel}
                      </Badge>
                      <Badge className={getTerritoryColor(customer.territory)} variant="outline">
                        {customer.territory}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <p>{customer.city}, {customer.state}</p>
                    <p className={`font-medium ${
                      customer.priority === 'high' ? 'text-red-600' :
                      customer.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {customer.priority.charAt(0).toUpperCase() + customer.priority.slice(1)} Priority
                    </p>
                    <p>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "CAD",
                        notation: "compact"
                      }).format(customer.accountValue)}
                    </p>
                    <p className={`${
                      customer.riskLevel === 'high' ? 'text-red-600' :
                      customer.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {customer.riskLevel.charAt(0).toUpperCase() + customer.riskLevel.slice(1)} Risk
                    </p>
                  </div>

                  {customer.daysSinceLastVisit > 30 && (
                    <Badge className="bg-orange-100 text-orange-700 mt-2" variant="outline">
                      Overdue Visit ({customer.daysSinceLastVisit}d)
                    </Badge>
                  )}
                </div>
              ))}
              
              {filteredMapCustomers.filter(c => c.isVisible).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <IconUsers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No customers match the selected filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
    
    </Tabs>
    </div>
  )
}