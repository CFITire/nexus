"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DateRangePicker } from '@/components/date-range-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Phone, PhoneCall, PhoneOff, Download, Search, Filter } from 'lucide-react'
import { useRBAC } from '@/hooks/use-rbac'
import { freepbxClient, formatPhoneNumber, parseCallDuration, type CallLog } from '@/lib/freepbx'

export function CallHistoryContent() {
  const { hasPermission } = useRBAC()
  const [calls, setCalls] = useState<CallLog[]>([])
  const [filteredCalls, setFilteredCalls] = useState<CallLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [directionFilter, setDirectionFilter] = useState<string>('all')
  const [dispositionFilter, setDispositionFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  const canViewHistory = hasPermission('communications', 'read')

  useEffect(() => {
    if (canViewHistory) {
      loadCallHistory()
    }
  }, [canViewHistory])

  useEffect(() => {
    filterCalls()
  }, [calls, searchTerm, directionFilter, dispositionFilter, dateRange])

  const loadCallHistory = async () => {
    try {
      setIsLoading(true)
      
      const startDate = dateRange.from?.toISOString().split('T')[0]
      const endDate = dateRange.to?.toISOString().split('T')[0]
      
      const callHistory = await freepbxClient.getCallLogs(startDate, endDate, 500)
      setCalls(callHistory)
      
    } catch (error) {
      console.error('Failed to load call history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterCalls = () => {
    let filtered = [...calls]

    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(call => 
        call.clid.toLowerCase().includes(term) ||
        call.src.includes(term) ||
        call.dst.includes(term) ||
        call.disposition.toLowerCase().includes(term)
      )
    }

    // Direction filter
    if (directionFilter !== 'all') {
      filtered = filtered.filter(call => {
        const direction = getCallDirection(call)
        return direction === directionFilter
      })
    }

    // Disposition filter
    if (dispositionFilter !== 'all') {
      filtered = filtered.filter(call => call.disposition === dispositionFilter)
    }

    // Date range filter
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(call => {
        const callDate = new Date(call.date)
        if (dateRange.from && callDate < dateRange.from) return false
        if (dateRange.to && callDate > dateRange.to) return false
        return true
      })
    }

    setFilteredCalls(filtered)
  }

  const getCallDirection = (call: CallLog): 'inbound' | 'outbound' | 'internal' => {
    // Simplified logic - in practice you'd check against your extension list
    const srcIsExtension = call.src.length <= 4
    const dstIsExtension = call.dst.length <= 4
    
    if (srcIsExtension && dstIsExtension) return 'internal'
    if (srcIsExtension) return 'outbound'
    return 'inbound'
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

  const exportToCSV = () => {
    const headers = ['Date', 'From', 'To', 'Direction', 'Duration', 'Status']
    const csvContent = [
      headers.join(','),
      ...filteredCalls.map(call => [
        new Date(call.date).toLocaleString(),
        `"${call.clid || call.src}"`,
        call.dst,
        getCallDirection(call),
        parseCallDuration(call.billsec),
        call.disposition
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `call-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!canViewHistory) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">You don't have permission to view call history.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Call History</h1>
          <p className="text-muted-foreground">
            View and search through all call records
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" disabled={filteredCalls.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={loadCallHistory} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search calls..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Direction</label>
              <Select value={directionFilter} onValueChange={setDirectionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Directions</SelectItem>
                  <SelectItem value="inbound">Inbound</SelectItem>
                  <SelectItem value="outbound">Outbound</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={dispositionFilter} onValueChange={setDispositionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="ANSWERED">Answered</SelectItem>
                  <SelectItem value="NO ANSWER">No Answer</SelectItem>
                  <SelectItem value="BUSY">Busy</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <DateRangePicker
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredCalls.length} of {calls.length} calls
            </p>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {filteredCalls.filter(c => c.disposition === 'ANSWERED').length}
                </p>
                <p className="text-xs text-muted-foreground">Answered</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredCalls.filter(c => c.disposition === 'BUSY').length}
                </p>
                <p className="text-xs text-muted-foreground">Busy</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {filteredCalls.filter(c => c.disposition === 'NO ANSWER').length}
                </p>
                <p className="text-xs text-muted-foreground">Missed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Call Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading call history...</p>
            </div>
          ) : filteredCalls.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No calls found matching your filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCalls.slice(0, 100).map((call) => (
                  <TableRow key={call.uniqueid}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {new Date(call.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(call.date).toLocaleTimeString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getCallTypeIcon(call)}
                        <span>{call.clid || call.src}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatPhoneNumber(call.dst)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getCallDirection(call)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {parseCallDuration(call.billsec)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        call.disposition === 'ANSWERED' ? 'default' :
                        call.disposition === 'BUSY' ? 'secondary' :
                        'destructive'
                      }>
                        {call.disposition}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {filteredCalls.length > 100 && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Showing first 100 results. Use filters to narrow down your search.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}