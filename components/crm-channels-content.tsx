"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { IconPlus, IconEdit, IconTrendingUp, IconUsers, IconMapPin, IconPhone, IconMail, IconBuilding } from "@tabler/icons-react"
import { DataTable } from "@/components/data-table"

interface Channel {
  id: string
  name: string
  type: 'direct' | 'dealer' | 'distributor' | 'online' | 'retail'
  status: 'active' | 'inactive' | 'pending'
  region: string
  contactPerson: string
  phone: string
  email: string
  address: string
  revenue: number
  accounts: number
  performance: number
  lastContact: string
  notes: string
}

interface ChannelPerformance {
  channelId: string
  channelName: string
  monthlyRevenue: number
  yearlyRevenue: number
  accountsManaged: number
  conversionRate: number
  avgDealSize: number
  topOpportunities: number
}

export function CrmChannelsContent() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [performance, setPerformance] = useState<ChannelPerformance[]>([])
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    // Mock channel data
    setChannels([
      {
        id: "1",
        name: "CFI Direct Sales",
        type: "direct",
        status: "active",
        region: "Alberta",
        contactPerson: "John Smith",
        phone: "(780) 555-0123",
        email: "john.smith@cfi.com",
        address: "123 Industrial Blvd, Edmonton, AB",
        revenue: 2500000,
        accounts: 45,
        performance: 92,
        lastContact: "2024-06-10",
        notes: "Primary direct sales channel for Alberta region"
      },
      {
        id: "2", 
        name: "Western Equipment Dealers",
        type: "dealer",
        status: "active",
        region: "Western Canada",
        contactPerson: "Sarah Johnson",
        phone: "(604) 555-0456",
        email: "sarah@westernequip.com",
        address: "456 Commerce Way, Vancouver, BC",
        revenue: 1850000,
        accounts: 32,
        performance: 87,
        lastContact: "2024-06-08",
        notes: "Strong dealer network across BC and Saskatchewan"
      },
      {
        id: "3",
        name: "Northern Distributors",
        type: "distributor", 
        status: "active",
        region: "Northern Canada",
        contactPerson: "Mike Wilson",
        phone: "(867) 555-0789",
        email: "mike@northerndist.com",
        address: "789 Supply Chain Dr, Yellowknife, NT",
        revenue: 950000,
        accounts: 18,
        performance: 78,
        lastContact: "2024-05-28",
        notes: "Specialized in remote location delivery"
      },
      {
        id: "4",
        name: "CFI Online Store",
        type: "online",
        status: "active", 
        region: "National",
        contactPerson: "Lisa Chen",
        phone: "(403) 555-0321",
        email: "lisa.chen@cfi.com",
        address: "Digital Platform",
        revenue: 1200000,
        accounts: 156,
        performance: 85,
        lastContact: "2024-06-12",
        notes: "E-commerce platform for small orders and parts"
      }
    ])

    // Mock performance data
    setPerformance([
      {
        channelId: "1",
        channelName: "CFI Direct Sales",
        monthlyRevenue: 210000,
        yearlyRevenue: 2500000,
        accountsManaged: 45,
        conversionRate: 68,
        avgDealSize: 55600,
        topOpportunities: 8
      },
      {
        channelId: "2",
        channelName: "Western Equipment Dealers", 
        monthlyRevenue: 154000,
        yearlyRevenue: 1850000,
        accountsManaged: 32,
        conversionRate: 52,
        avgDealSize: 57800,
        topOpportunities: 6
      }
    ])
  }, [])

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'direct': return 'bg-blue-100 text-blue-800'
      case 'dealer': return 'bg-green-100 text-green-800'
      case 'distributor': return 'bg-purple-100 text-purple-800'
      case 'online': return 'bg-orange-100 text-orange-800'
      case 'retail': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredChannels = channels.filter(channel => {
    if (filterType !== "all" && channel.type !== filterType) return false
    if (filterStatus !== "all" && channel.status !== filterStatus) return false
    return true
  })

  const totalRevenue = channels.reduce((sum, channel) => sum + channel.revenue, 0)
  const totalAccounts = channels.reduce((sum, channel) => sum + channel.accounts, 0)
  const avgPerformance = channels.reduce((sum, channel) => sum + channel.performance, 0) / channels.length

  const columns = [
    {
      accessorKey: "name",
      header: "Channel Name",
    },
    {
      accessorKey: "type", 
      header: "Type",
      cell: ({ row }: any) => (
        <Badge className={getTypeColor(row.getValue("type"))}>
          {row.getValue("type")}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge className={getStatusColor(row.getValue("status"))}>
          {row.getValue("status")}
        </Badge>
      ),
    },
    {
      accessorKey: "region",
      header: "Region",
    },
    {
      accessorKey: "contactPerson",
      header: "Contact",
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
          <div className="flex items-center gap-2">
            <span>{performance}%</span>
            <div className="w-12 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-green-500 rounded-full"
                style={{ width: `${performance}%` }}
              />
            </div>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Channels</CardTitle>
            <IconBuilding className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{channels.length}</div>
            <p className="text-xs text-muted-foreground">Active partnerships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "CAD",
                notation: "compact"
              }).format(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">YTD across all channels</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <IconUsers className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAccounts}</div>
            <p className="text-xs text-muted-foreground">Managed across channels</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPerformance.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Channel effectiveness</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBuilding className="h-5 w-5" />
            Channel Management
          </CardTitle>
          <CardDescription>
            Manage and monitor your sales channels and partner relationships
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Type:</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="direct">Direct</SelectItem>
                  <SelectItem value="dealer">Dealer</SelectItem>
                  <SelectItem value="distributor">Distributor</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Status:</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="ml-auto">
              <IconPlus className="h-4 w-4 mr-2" />
              Add Channel
            </Button>
          </div>

          <DataTable 
            columns={columns} 
            data={filteredChannels}
            searchKey="name"
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Channels</CardTitle>
            <CardDescription>Channels ranked by performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {channels
                .sort((a, b) => b.performance - a.performance)
                .slice(0, 3)
                .map((channel, index) => (
                  <div key={channel.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{channel.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {channel.type} • {channel.region}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{channel.performance}%</p>
                      <p className="text-sm text-muted-foreground">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "CAD",
                          notation: "compact"
                        }).format(channel.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Channel Types Distribution</CardTitle>
            <CardDescription>Revenue breakdown by channel type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['direct', 'dealer', 'distributor', 'online'].map((type) => {
                const typeChannels = channels.filter(c => c.type === type)
                const typeRevenue = typeChannels.reduce((sum, c) => sum + c.revenue, 0)
                const percentage = totalRevenue > 0 ? (typeRevenue / totalRevenue) * 100 : 0
                
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-medium">{type}</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-primary rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{typeChannels.length} channels</span>
                      <span>
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "CAD",
                          notation: "compact"
                        }).format(typeRevenue)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}