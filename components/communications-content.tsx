"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Phone, PhoneCall, PhoneOff, Clock, Users, TrendingUp, Activity } from 'lucide-react'
import { useRBAC } from '@/hooks/use-rbac'
import { freepbxClient, formatPhoneNumber, parseCallDuration, type Extension, type CallLog } from '@/lib/freepbx'
import { WebRTCPhone } from './webrtc-phone'

export function CommunicationsContent() {
  const { hasPermission } = useRBAC()
  const [extensions, setExtensions] = useState<Extension[]>([])
  const [recentCalls, setRecentCalls] = useState<CallLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [callStats, setCallStats] = useState({
    totalCalls: 0,
    activeExtensions: 0,
    avgCallDuration: 0,
    answeredCalls: 0
  })

  const canViewCommunications = hasPermission('communications', 'read')
  const canMakeCalls = hasPermission('communications', 'create')
  const canManagePhone = hasPermission('communications', 'manage')

  useEffect(() => {
    if (canViewCommunications) {
      loadCommunicationsData()
    }
  }, [canViewCommunications])

  const loadCommunicationsData = async () => {
    try {
      setIsLoading(true)
      
      // Load extensions and call history in parallel
      const [extensionsData, callLogsData] = await Promise.all([
        freepbxClient.getExtensions(),
        freepbxClient.getCallLogs(undefined, undefined, 50)
      ])

      setExtensions(extensionsData)
      setRecentCalls(callLogsData)

      // Calculate statistics
      const activeExts = extensionsData.filter(ext => ext.status === 'available').length
      const totalCalls = callLogsData.length
      const answeredCalls = callLogsData.filter(call => call.disposition === 'ANSWERED').length
      const avgDuration = answeredCalls > 0 
        ? callLogsData
            .filter(call => call.disposition === 'ANSWERED')
            .reduce((sum, call) => sum + call.billsec, 0) / answeredCalls
        : 0

      setCallStats({
        totalCalls,
        activeExtensions: activeExts,
        avgCallDuration: Math.round(avgDuration),
        answeredCalls
      })

    } catch (error) {
      console.error('Failed to load communications data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCallTypeIcon = (call: CallLog) => {
    if (call.disposition === 'ANSWERED') {
      return <PhoneCall className="h-4 w-4 text-green-500" />
    } else if (call.disposition === 'BUSY') {
      return <PhoneOff className="h-4 w-4 text-yellow-500" />
    } else {
      return <PhoneOff className="h-4 w-4 text-red-500" />
    }
  }

  const getCallDirection = (call: CallLog) => {
    // Simplified logic - in practice you'd check against your extension list
    if (call.src.length <= 4) return 'outbound' // Extension number
    return 'inbound' // External number
  }

  if (!canViewCommunications) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">You don't have permission to view communications.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communications Dashboard</h1>
          <p className="text-muted-foreground">
            Unified communications and call management
          </p>
        </div>
        <Button onClick={loadCommunicationsData} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls Today</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{callStats.totalCalls}</div>
            <p className="text-xs text-muted-foreground">
              {callStats.answeredCalls} answered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Extensions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{callStats.activeExtensions}</div>
            <p className="text-xs text-muted-foreground">
              of {extensions.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Call Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parseCallDuration(callStats.avgCallDuration)}</div>
            <p className="text-xs text-muted-foreground">
              for answered calls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Answer Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {callStats.totalCalls > 0 ? Math.round((callStats.answeredCalls / callStats.totalCalls) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              calls answered
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="extensions">Extensions</TabsTrigger>
          <TabsTrigger value="recent-calls">Recent Calls</TabsTrigger>
          {canMakeCalls && <TabsTrigger value="phone">Phone</TabsTrigger>}
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Extension Status */}
            <Card>
              <CardHeader>
                <CardTitle>Extension Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {extensions.slice(0, 5).map((ext) => (
                    <div key={ext.extension} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Activity 
                          className={`h-4 w-4 ${
                            ext.status === 'available' ? 'text-green-500' :
                            ext.status === 'busy' ? 'text-yellow-500' :
                            'text-red-500'
                          }`} 
                        />
                        <div>
                          <p className="font-medium">{ext.name}</p>
                          <p className="text-sm text-muted-foreground">Ext. {ext.extension}</p>
                        </div>
                      </div>
                      <Badge variant={
                        ext.status === 'available' ? 'default' :
                        ext.status === 'busy' ? 'secondary' :
                        'destructive'
                      }>
                        {ext.status}
                      </Badge>
                    </div>
                  ))}
                  {extensions.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{extensions.length - 5} more extensions
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Call Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Call Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentCalls.slice(0, 5).map((call) => (
                    <div key={call.uniqueid} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getCallTypeIcon(call)}
                        <div>
                          <p className="font-medium">
                            {getCallDirection(call) === 'inbound' ? call.clid : formatPhoneNumber(call.dst)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(call.date).toLocaleTimeString()} • {parseCallDuration(call.billsec)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {getCallDirection(call)}
                      </Badge>
                    </div>
                  ))}
                  {recentCalls.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{recentCalls.length - 5} more calls
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="extensions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Extensions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {extensions.map((ext) => (
                  <div key={ext.extension} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{ext.name}</h4>
                      <Badge variant={
                        ext.status === 'available' ? 'default' :
                        ext.status === 'busy' ? 'secondary' :
                        'destructive'
                      }>
                        {ext.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Extension {ext.extension}</p>
                    <p className="text-xs text-muted-foreground">{ext.device}</p>
                    {ext.lastActivity && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last activity: {new Date(ext.lastActivity).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent-calls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentCalls.map((call) => (
                  <div key={call.uniqueid} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getCallTypeIcon(call)}
                        <div>
                          <p className="font-medium">
                            {getCallDirection(call) === 'inbound' 
                              ? `${call.clid} → ${call.dst}`
                              : `${call.src} → ${formatPhoneNumber(call.dst)}`
                            }
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(call.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          {getCallDirection(call)}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          Duration: {parseCallDuration(call.billsec)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Status: {call.disposition}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {canMakeCalls && (
          <TabsContent value="phone" className="space-y-4">
            <div className="flex justify-center">
              <WebRTCPhone 
                extension="1001" // This would come from user profile/settings
                onCallStateChange={(state) => {
                  console.log('Call state changed:', state)
                  // Refresh data when call ends to update statistics
                  if (state.status === 'disconnected') {
                    setTimeout(loadCommunicationsData, 1000)
                  }
                }}
                onIncomingCall={(callerInfo) => {
                  console.log('Incoming call from:', callerInfo)
                  // Could show a notification here
                }}
              />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}