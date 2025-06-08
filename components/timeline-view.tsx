"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { IconCalendar, IconUser, IconBuilding, IconLoader } from "@tabler/icons-react"

interface InspectionData {
  No: string
  Inspection_Date: string
  Inspector_Name: string
  Sales_Order_No?: string
  Customer_Name?: string
  Status?: string
  Location_Code?: string
  Inspection_Type?: string
  Inspection_Category?: string
}

interface TimelineViewProps {
  inspections: InspectionData[]
  isLoading: boolean
}

const statusColors = {
  Open: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Completed: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  Rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  Cancelled: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
}

export function TimelineView({ inspections, isLoading }: TimelineViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <IconLoader className="animate-spin size-4" />
          Loading timeline...
        </div>
      </div>
    )
  }

  // Sort inspections by date (newest first)
  const sortedInspections = [...inspections].sort((a, b) => 
    new Date(b.Inspection_Date).getTime() - new Date(a.Inspection_Date).getTime()
  )

  // Group inspections by date
  const groupedInspections = sortedInspections.reduce((groups, inspection) => {
    const date = inspection.Inspection_Date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(inspection)
    return groups
  }, {} as Record<string, InspectionData[]>)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="max-w-4xl mx-auto">
        {Object.entries(groupedInspections).map(([date, dayInspections]) => (
          <div key={date} className="relative">
            {/* Date Header */}
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                {formatDate(date)}
              </div>
              <div className="flex-1 h-px bg-border" />
              <Badge variant="outline" className="text-xs">
                {dayInspections.length} inspection{dayInspections.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {/* Timeline Line */}
            <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />

            {/* Inspections */}
            <div className="space-y-4 mb-8">
              {dayInspections.map((inspection, index) => (
                <div key={inspection.No} className="relative">
                  {/* Timeline Dot */}
                  <div className="absolute left-4 w-4 h-4 bg-primary border-2 border-background rounded-full" />
                  
                  {/* Inspection Card */}
                  <div className="ml-12">
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium">
                              {inspection.No}
                            </span>
                            {inspection.Inspection_Type && (
                              <Badge variant="outline" className="text-xs">
                                {inspection.Inspection_Type}
                              </Badge>
                            )}
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${statusColors[inspection.Status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'}`}
                          >
                            {inspection.Status || "Open"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {inspection.Inspector_Name && (
                          <div className="flex items-center gap-2 text-sm">
                            <IconUser className="size-4 text-muted-foreground" />
                            <span>{inspection.Inspector_Name}</span>
                          </div>
                        )}
                        
                        {inspection.Customer_Name && (
                          <div className="flex items-center gap-2 text-sm">
                            <IconBuilding className="size-4 text-muted-foreground" />
                            <span>{inspection.Customer_Name}</span>
                          </div>
                        )}
                        
                        {inspection.Sales_Order_No && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">SO:</span> {inspection.Sales_Order_No}
                          </div>
                        )}
                        
                        {inspection.Location_Code && (
                          <div className="flex items-center">
                            <Badge variant="outline" className="text-xs">
                              {inspection.Location_Code}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {sortedInspections.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              No inspections found
            </div>
          </div>
        )}
      </div>
    </div>
  )
}