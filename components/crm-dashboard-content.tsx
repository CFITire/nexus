"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useAccounts, useContacts, useOpportunities, useRefreshCRMData } from "@/hooks/use-crm"
import { IconFileText, IconShoppingCart, IconUsers, IconPhone, IconMail, IconCalendar, IconClock, IconTrendingUp, IconAlertTriangle, IconRefresh } from "@tabler/icons-react"

interface Quote {
  id: string
  customerName: string
  quoteNumber: string
  amount: number
  status: 'pending' | 'sent' | 'follow-up' | 'expired'
  daysOld: number
  items: string
  priority: 'high' | 'medium' | 'low'
  nextAction: string
}

interface Order {
  id: string
  customerName: string
  orderNumber: string
  amount: number
  status: 'submitted' | 'confirmed' | 'processing' | 'shipped'
  submittedDate: string
  expectedDelivery: string
  items: string
}

interface SuggestedLead {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string
  industry: string
  reason: string
  lastInteraction: string
  score: number
  source: string
}

export function CrmDashboardContent() {
  // Use TanStack Query hooks for real CRM data
  const { 
    data: accountsData, 
    isLoading: accountsLoading, 
    error: accountsError 
  } = useAccounts()
  
  const { 
    data: contactsData, 
    isLoading: contactsLoading, 
    error: contactsError 
  } = useContacts()
  
  const { 
    data: opportunitiesData, 
    isLoading: opportunitiesLoading, 
    error: opportunitiesError 
  } = useOpportunities()

  const refreshMutation = useRefreshCRMData()

  // Extract data from API response format
  const accounts = accountsData?.value || []
  const contacts = contactsData?.value || []
  const opportunities = opportunitiesData?.value || []

  // Mock data for quotes that need attention (until we have real quote data)
  const [quotes] = useState<Quote[]>([
      {
        id: "1",
        customerName: "Titan Construction Ltd",
        quoteNumber: "Q-2024-001234",
        amount: 45000,
        status: "follow-up",
        daysOld: 5,
        items: "Heavy duty tires (20), Rims (20)",
        priority: "high",
        nextAction: "Follow up on pricing concerns"
      },
      {
        id: "2",
        customerName: "Northern Transport Co",
        quoteNumber: "Q-2024-001235", 
        amount: 28000,
        status: "sent",
        daysOld: 2,
        items: "Fleet tire replacement package",
        priority: "medium",
        nextAction: "Wait for customer response"
      },
      {
        id: "3",
        customerName: "Prairie Mining Corp",
        quoteNumber: "Q-2024-001236",
        amount: 67000,
        status: "pending",
        daysOld: 1,
        items: "Mining equipment tires (35)",
        priority: "high",
        nextAction: "Complete quote and send"
      }
    ])

  // Mock data for recent orders (until we have real order data)
  const [orders] = useState<Order[]>([
    {
      id: "1",
      customerName: "Acme Corporation",
      orderNumber: "SO-2024-005678",
      amount: 32000,
      status: "confirmed",
      submittedDate: "2024-06-10",
      expectedDelivery: "2024-06-15",
      items: "Commercial truck tires (24)"
    },
    {
      id: "2",
      customerName: "Western Equipment Dealers",
      orderNumber: "SO-2024-005679",
      amount: 18500,
      status: "processing",
      submittedDate: "2024-06-09",
      expectedDelivery: "2024-06-14",
      items: "Forklift tires (12), Wheels (12)"
    },
    {
      id: "3",
      customerName: "Beta Industries",
      orderNumber: "SO-2024-005680", 
      amount: 41000,
      status: "shipped",
      submittedDate: "2024-06-08",
      expectedDelivery: "2024-06-13",
      items: "Heavy equipment tire set"
    }
  ])

  // Mock data for suggested leads (until we have real lead scoring)
  const [suggestedLeads] = useState<SuggestedLead[]>([
    {
      id: "1",
      companyName: "Arctic Logistics Inc",
      contactName: "Jennifer Martinez",
      email: "j.martinez@arcticlogistics.com",
      phone: "(867) 555-0199",
      industry: "Transportation",
      reason: "Recent equipment purchase, no tire supplier",
      lastInteraction: "2024-05-28",
      score: 87,
      source: "Industry database"
    },
    {
      id: "2",
      companyName: "Mountain Mining Solutions",
      contactName: "Robert Kim",
      email: "r.kim@mountainmining.com", 
      phone: "(403) 555-0287",
      industry: "Mining",
      reason: "Contract renewal coming up in 30 days",
      lastInteraction: "2024-04-15",
      score: 92,
      source: "Competitor analysis"
    },
    {
      id: "3",
      companyName: "Frontier Construction",
      contactName: "Amanda Thompson",
      email: "a.thompson@frontier.ca",
      phone: "(780) 555-0345",
      industry: "Construction", 
      reason: "Expanding fleet, seeking tire partner",
      lastInteraction: "Never",
      score: 74,
      source: "Trade publication"
    }
  ])

  // Combined loading state
  const isLoading = accountsLoading || contactsLoading || opportunitiesLoading
  const hasError = accountsError || contactsError || opportunitiesError

  const handleRefresh = () => {
    refreshMutation.mutate()
  }

  const getQuoteStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'follow-up': return 'bg-orange-100 text-orange-800'
      case 'expired': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <IconAlertTriangle className="h-4 w-4 text-red-500" />
      case 'medium': return <IconClock className="h-4 w-4 text-yellow-500" />
      case 'low': return <IconTrendingUp className="h-4 w-4 text-green-500" />
      default: return null
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show error state
  if (hasError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <IconAlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading CRM Data</h3>
              <p className="text-muted-foreground mb-4">
                There was an error loading your CRM dashboard data. Please try refreshing.
              </p>
              <Button onClick={handleRefresh} disabled={refreshMutation.isPending}>
                <IconRefresh className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">CRM Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time data from Dataverse • {accounts.length} accounts • {contacts.length} contacts • {opportunities.length} opportunities
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshMutation.isPending}>
          <IconRefresh className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Quotes</CardTitle>
            <IconFileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotes.length}</div>
            <p className="text-xs text-muted-foreground">
              {quotes.filter(q => q.status === 'follow-up').length} need follow-up
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
            <IconShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">
              {orders.filter(o => o.status === 'processing').length} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suggested Leads</CardTitle>
            <IconUsers className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suggestedLeads.length}</div>
            <p className="text-xs text-muted-foreground">
              High potential contacts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "CAD",
                notation: "compact"
              }).format(quotes.reduce((sum, quote) => sum + quote.amount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Active quote value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="quotes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="quotes">Quotes to Review</TabsTrigger>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="leads">Suggested Leads</TabsTrigger>
        </TabsList>

        <TabsContent value="quotes">
          <Card>
            <CardHeader>
              <CardTitle>Quotes Requiring Attention</CardTitle>
              <CardDescription>
                Quotes that need follow-up, completion, or review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotes.map((quote) => (
                  <div key={quote.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {getPriorityIcon(quote.priority)}
                          {quote.customerName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {quote.quoteNumber} • {quote.items}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "CAD"
                          }).format(quote.amount)}
                        </p>
                        <Badge className={getQuoteStatusColor(quote.status)}>
                          {quote.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <IconClock className="h-4 w-4" />
                          {quote.daysOld} days old
                        </span>
                        <span className="text-muted-foreground">
                          Next: {quote.nextAction}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <IconPhone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline">
                          <IconMail className="h-4 w-4 mr-1" />
                          Email
                        </Button>
                        <Button size="sm">View Quote</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Orders you've submitted and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{order.customerName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {order.orderNumber} • {order.items}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "CAD"
                          }).format(order.amount)}
                        </p>
                        <Badge className={getOrderStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Submitted:</span>
                        <p className="font-medium">{order.submittedDate}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expected Delivery:</span>
                        <p className="font-medium">{order.expectedDelivery}</p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button size="sm" variant="outline">
                        Track Order
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>Suggested Contacts</CardTitle>
              <CardDescription>
                High-potential leads you should reach out to
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suggestedLeads.map((lead) => (
                  <div key={lead.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{lead.companyName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {lead.contactName} • {lead.industry}
                        </p>
                        <p className="text-sm text-blue-600 mt-1">
                          Why: {lead.reason}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Score:</span>
                          <Badge className="bg-green-100 text-green-800">
                            {lead.score}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {lead.source}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p className="font-medium">{lead.email}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phone:</span>
                        <p className="font-medium">{lead.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">
                        Last interaction: {lead.lastInteraction}
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <IconPhone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline">
                          <IconMail className="h-4 w-4 mr-1" />
                          Email
                        </Button>
                        <Button size="sm">Add to CRM</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}