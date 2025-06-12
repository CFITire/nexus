"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconMapPin, IconUser, IconChartBar, IconEdit, IconPlus } from "@tabler/icons-react"
import { DataTable } from "@/components/data-table"

interface Territory {
  id: string
  name: string
  salesperson: string
  region: string
  accounts: number
  revenue: number
  quota: number
  performance: number
  lastUpdated: string
}

interface SalespersonPerformance {
  name: string
  territory: string
  accounts: number
  revenue: number
  quota: number
  achievement: number
  topAccount: string
}

export function CrmTerritoryContent() {
  const [territories, setTerritories] = useState<Territory[]>([])
  const [salespeople, setSalespeople] = useState<SalespersonPerformance[]>([])
  const [selectedTerritory, setSelectedTerritory] = useState<string>("all")

  useEffect(() => {
    // Mock territory data
    setTerritories([
      {
        id: "1",
        name: "Calgary Metro",
        salesperson: "John Smith", 
        region: "Alberta South",
        accounts: 45,
        revenue: 1250000,
        quota: 1500000,
        performance: 83.3,
        lastUpdated: "2024-06-10"
      },
      {
        id: "2",
        name: "Edmonton Metro",
        salesperson: "Sarah Johnson",
        region: "Alberta North", 
        accounts: 38,
        revenue: 980000,
        quota: 1200000,
        performance: 81.7,
        lastUpdated: "2024-06-11"
      },
      {
        id: "3",
        name: "Northern Alberta",
        salesperson: "Mike Wilson",
        region: "Alberta North",
        accounts: 22,
        revenue: 750000,
        quota: 800000,
        performance: 93.8,
        lastUpdated: "2024-06-09"
      },
      {
        id: "4",
        name: "Southern Alberta",
        salesperson: "Lisa Brown",
        region: "Alberta South",
        accounts: 35,
        revenue: 1100000,
        quota: 1300000,
        performance: 84.6,
        lastUpdated: "2024-06-12"
      }
    ])

    // Mock salesperson performance data
    setSalespeople([
      {
        name: "John Smith",
        territory: "Calgary Metro",
        accounts: 45,
        revenue: 1250000,
        quota: 1500000,
        achievement: 83.3,
        topAccount: "Acme Corporation"
      },
      {
        name: "Sarah Johnson", 
        territory: "Edmonton Metro",
        accounts: 38,
        revenue: 980000,
        quota: 1200000,
        achievement: 81.7,
        topAccount: "Beta Industries"
      },
      {
        name: "Mike Wilson",
        territory: "Northern Alberta", 
        accounts: 22,
        revenue: 750000,
        quota: 800000,
        achievement: 93.8,
        topAccount: "Northern Transport"
      },
      {
        name: "Lisa Brown",
        territory: "Southern Alberta",
        accounts: 35,
        revenue: 1100000,
        quota: 1300000,
        achievement: 84.6,
        topAccount: "Prairie Mining"
      }
    ])
  }, [])

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-green-600"
    if (performance >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const getPerformanceBadge = (performance: number) => {
    if (performance >= 90) return "bg-green-100 text-green-800"
    if (performance >= 80) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const territoryColumns = [
    {
      accessorKey: "name",
      header: "Territory Name",
    },
    {
      accessorKey: "salesperson",
      header: "Sales Rep",
    },
    {
      accessorKey: "region",
      header: "Region",
    },
    {
      accessorKey: "accounts",
      header: "Accounts",
    },
    {
      accessorKey: "revenue",
      header: "Revenue",
      cell: ({ row }: any) => {
        const amount = parseFloat(row.getValue("revenue"))
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "CAD",
          notation: "compact"
        }).format(amount)
        return formatted
      },
    },
    {
      accessorKey: "performance",
      header: "Performance",
      cell: ({ row }: any) => {
        const performance = row.getValue("performance") as number
        return (
          <Badge className={getPerformanceBadge(performance)}>
            {performance}%
          </Badge>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Territories</CardTitle>
            <IconMapPin className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{territories.length}</div>
            <p className="text-xs text-muted-foreground">Active territories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <IconUser className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {territories.reduce((sum, t) => sum + t.accounts, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Managed accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IconChartBar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "CAD",
                notation: "compact"
              }).format(territories.reduce((sum, t) => sum + t.revenue, 0))}
            </div>
            <p className="text-xs text-muted-foreground">YTD revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <IconChartBar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(territories.reduce((sum, t) => sum + t.performance, 0) / territories.length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Quota achievement</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconMapPin className="h-5 w-5" />
              Territory Management
            </CardTitle>
            <CardDescription>
              Manage sales territories and assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-4">
              <Select value={selectedTerritory} onValueChange={setSelectedTerritory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Territories</SelectItem>
                  {territories.map((territory) => (
                    <SelectItem key={territory.id} value={territory.id}>
                      {territory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <IconEdit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button size="sm">
                  <IconPlus className="h-4 w-4 mr-1" />
                  New Territory
                </Button>
              </div>
            </div>

            <DataTable 
              columns={territoryColumns}
              data={territories}
              searchKey="name"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUser className="h-5 w-5" />
              Salesperson Performance
            </CardTitle>
            <CardDescription>
              Individual performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salespeople.map((person, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{person.name}</h4>
                    <Badge className={getPerformanceBadge(person.achievement)}>
                      {person.achievement}%
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {person.territory}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Accounts:</span>
                      <p className="font-medium">{person.accounts}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Revenue:</span>
                      <p className="font-medium">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "CAD",
                          notation: "compact"
                        }).format(person.revenue)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Quota:</span>
                      <p className="font-medium">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency", 
                          currency: "CAD",
                          notation: "compact"
                        }).format(person.quota)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Top Account:</span>
                      <p className="font-medium">{person.topAccount}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Quota Progress</span>
                      <span>{person.achievement}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          person.achievement >= 90 ? 'bg-green-500' :
                          person.achievement >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(person.achievement, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}