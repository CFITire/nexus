"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { IconSearch, IconTarget, IconPhone, IconMail, IconBuildingStore } from "@tabler/icons-react"

interface Lead {
  id: string
  companyName: string
  contactName: string
  industry: string
  location: string
  revenue: string
  employees: string
  phone: string
  email: string
  score: number
  source: string
  status: 'new' | 'contacted' | 'qualified' | 'converted'
}

export function CrmLeadFinderContent() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [searchCriteria, setSearchCriteria] = useState({
    industry: "",
    location: "",
    revenueMin: "",
    revenueMax: "",
    employeeMin: "",
    employeeMax: ""
  })

  useEffect(() => {
    // Mock lead data
    setLeads([
      {
        id: "1",
        companyName: "Titan Construction Ltd",
        contactName: "Mike Johnson",
        industry: "Construction",
        location: "Calgary, AB",
        revenue: "$2M - $5M",
        employees: "50-100",
        phone: "(403) 555-0123",
        email: "mike.johnson@titan.ca",
        score: 85,
        source: "LinkedIn",
        status: "new"
      },
      {
        id: "2", 
        companyName: "Northern Transport Co",
        contactName: "Sarah Wilson",
        industry: "Transportation",
        location: "Edmonton, AB",
        revenue: "$5M - $10M", 
        employees: "100-200",
        phone: "(780) 555-0456",
        email: "s.wilson@northern.ca",
        score: 92,
        source: "Website",
        status: "contacted"
      },
      {
        id: "3",
        companyName: "Prairie Mining Corp",
        contactName: "David Chen",
        industry: "Mining",
        location: "Saskatoon, SK",
        revenue: "$10M+",
        employees: "200+",
        phone: "(306) 555-0789",
        email: "d.chen@prairie.ca", 
        score: 78,
        source: "Trade Show",
        status: "qualified"
      },
      {
        id: "4",
        companyName: "Rocky Mountain Logistics",
        contactName: "Lisa Brown",
        industry: "Transportation",
        location: "Vancouver, BC",
        revenue: "$1M - $2M",
        employees: "25-50",
        phone: "(604) 555-0321",
        email: "lisa@rmlogistics.ca",
        score: 67,
        source: "Cold Outreach",
        status: "new"
      }
    ])
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800"
    if (score >= 60) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'qualified': return 'bg-green-100 text-green-800'
      case 'converted': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconSearch className="h-5 w-5" />
            Lead Search Criteria
          </CardTitle>
          <CardDescription>
            Define your ideal customer profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Industry</label>
            <Select value={searchCriteria.industry} onValueChange={(value) => 
              setSearchCriteria(prev => ({ ...prev, industry: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="mining">Mining</SelectItem>
                <SelectItem value="oil-gas">Oil & Gas</SelectItem>
                <SelectItem value="forestry">Forestry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Input 
              placeholder="City, Province"
              value={searchCriteria.location}
              onChange={(e) => setSearchCriteria(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Annual Revenue</label>
            <div className="grid grid-cols-2 gap-2">
              <Input 
                placeholder="Min"
                value={searchCriteria.revenueMin}
                onChange={(e) => setSearchCriteria(prev => ({ ...prev, revenueMin: e.target.value }))}
              />
              <Input 
                placeholder="Max"
                value={searchCriteria.revenueMax}
                onChange={(e) => setSearchCriteria(prev => ({ ...prev, revenueMax: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Employees</label>
            <div className="grid grid-cols-2 gap-2">
              <Input 
                placeholder="Min"
                value={searchCriteria.employeeMin}
                onChange={(e) => setSearchCriteria(prev => ({ ...prev, employeeMin: e.target.value }))}
              />
              <Input 
                placeholder="Max"
                value={searchCriteria.employeeMax}
                onChange={(e) => setSearchCriteria(prev => ({ ...prev, employeeMax: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Filters</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="fleet" />
                <label htmlFor="fleet" className="text-sm">Has vehicle fleet</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="expansion" />
                <label htmlFor="expansion" className="text-sm">Recent expansion</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="contracts" />
                <label htmlFor="contracts" className="text-sm">Government contracts</label>
              </div>
            </div>
          </div>

          <Button className="w-full">
            <IconTarget className="h-4 w-4 mr-2" />
            Find Leads
          </Button>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBuildingStore className="h-5 w-5" />
            Lead Results
          </CardTitle>
          <CardDescription>
            Potential customers matching your criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leads.map((lead) => (
              <div key={lead.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">{lead.companyName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {lead.industry} • {lead.location}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getScoreColor(lead.score)}>
                      Score: {lead.score}
                    </Badge>
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Contact:</span>
                    <p className="font-medium">{lead.contactName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Revenue:</span>
                    <p className="font-medium">{lead.revenue}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Employees:</span>
                    <p className="font-medium">{lead.employees}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Source:</span>
                    <p className="font-medium">{lead.source}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <IconPhone className="h-4 w-4" />
                      {lead.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <IconMail className="h-4 w-4" />
                      {lead.email}
                    </div>
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
                    <Button size="sm">Add to CRM</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}