"use client"

import { useState, useEffect } from "react"
import { IconChartBar, IconChartLine, IconChartPie, IconTrendingUp, IconUsers, IconDatabase, IconActivity, IconCalendar } from "@tabler/icons-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRBAC } from "@/hooks/use-rbac"
import { toast } from "sonner"

interface AnalyticsData {
  overview: {
    totalUsers: number
    activeUsers: number
    totalSessions: number
    avgSessionDuration: number
  }
  userActivity: {
    date: string
    users: number
    sessions: number
  }[]
  moduleUsage: {
    module: string
    usage: number
    trend: number
  }[]
  systemHealth: {
    uptime: number
    responseTime: number
    errorRate: number
    dbConnections: number
  }
}

export function AnalyticsContent() {
  const { hasModuleAccess, loading: rbacLoading } = useRBAC()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    if (rbacLoading) return
    
    if (!hasModuleAccess('analytics')) {
      toast.error('Access denied to analytics module')
      setLoading(false)
      return
    }

    loadAnalyticsData()
  }, [rbacLoading, timeRange])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics?range=${timeRange}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }
      
      const data = await response.json()
      setAnalyticsData(data)
    } catch (error) {
      console.error('Failed to load analytics data:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state
  if (rbacLoading || loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  // Check analytics access
  if (!hasModuleAccess('analytics')) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Access Denied</p>
          <p className="text-sm text-muted-foreground">You don't have permission to access the analytics module.</p>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground">No analytics data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            System usage insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAnalyticsData}>
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="flex-1">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
          <TabsTrigger value="modules">Module Usage</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <IconUsers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData.overview.activeUsers} active this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <IconActivity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((analyticsData.overview.activeUsers / analyticsData.overview.totalUsers) * 100)}% of total users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <IconChartLine className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.totalSessions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
                <IconCalendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.avgSessionDuration}m</div>
                <p className="text-xs text-muted-foreground">
                  +2.1m from last period
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Placeholder */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconChartLine className="h-5 w-5" />
                  User Activity Trend
                </CardTitle>
                <CardDescription>Daily active users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Chart visualization would go here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconChartPie className="h-5 w-5" />
                  Module Usage Distribution
                </CardTitle>
                <CardDescription>Most popular features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Pie chart visualization would go here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Details</CardTitle>
              <CardDescription>Detailed breakdown of user engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.userActivity.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">{day.users} active users</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{day.sessions} sessions</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(day.sessions / day.users * 10) / 10} sessions/user
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Module Usage Statistics</CardTitle>
              <CardDescription>How different features are being used</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.moduleUsage.map((module, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <IconChartBar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{module.module}</p>
                        <p className="text-sm text-muted-foreground">{module.usage}% usage rate</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={module.trend >= 0 ? "default" : "secondary"}>
                        {module.trend >= 0 ? "+" : ""}{module.trend}%
                      </Badge>
                      {module.trend >= 0 ? (
                        <IconTrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <IconTrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                <IconActivity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.systemHealth.uptime}%</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <IconChartLine className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.systemHealth.responseTime}ms</div>
                <p className="text-xs text-muted-foreground">Average response time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <IconDatabase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.systemHealth.errorRate}%</div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">DB Connections</CardTitle>
                <IconDatabase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.systemHealth.dbConnections}</div>
                <p className="text-xs text-muted-foreground">Active connections</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>Real-time system health monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Real-time performance charts would go here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}