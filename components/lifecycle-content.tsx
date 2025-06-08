"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KanbanBoard } from "@/components/kanban-board"
import { TimelineView } from "@/components/timeline-view"
import { IconColumns, IconClock, IconRefresh } from "@tabler/icons-react"

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

export function LifecycleContent() {
  const [inspections, setInspections] = useState<InspectionData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchInspections = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/inspections')
      if (response.ok) {
        const data = await response.json()
        const inspectionList = data.value || data || []
        setInspections(Array.isArray(inspectionList) ? inspectionList : [])
      } else {
        console.error('Failed to fetch inspections:', response.statusText)
        setInspections([])
      }
    } catch (error) {
      console.error('Error fetching inspections:', error)
      setInspections([])
    } finally {
      setIsLoading(false)
    }
  }

  const updateInspectionStatus = async (inspectionNo: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/inspections/${inspectionNo}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Update local state
        setInspections(prev => 
          prev.map(inspection => 
            inspection.No === inspectionNo 
              ? { ...inspection, Status: newStatus }
              : inspection
          )
        )
      } else {
        console.error('Failed to update inspection status')
      }
    } catch (error) {
      console.error('Error updating inspection status:', error)
    }
  }

  useEffect(() => {
    fetchInspections()
  }, [])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between px-4 lg:px-6">
            <div>
              <h1 className="text-2xl font-bold">Inspection Lifecycle</h1>
              <p className="text-muted-foreground">
                Track and manage inspections through their complete lifecycle
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={fetchInspections}
              disabled={isLoading}
            >
              <IconRefresh className={isLoading ? "animate-spin" : ""} />
              Refresh
            </Button>
          </div>

          <Tabs defaultValue="kanban" className="w-full">
            <div className="px-4 lg:px-6">
              <TabsList>
                <TabsTrigger value="kanban">
                  <IconColumns className="mr-2 size-4" />
                  Kanban Board
                </TabsTrigger>
                <TabsTrigger value="timeline">
                  <IconClock className="mr-2 size-4" />
                  Timeline View
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="kanban" className="mt-4">
              <KanbanBoard 
                inspections={inspections}
                onStatusUpdate={updateInspectionStatus}
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="timeline" className="mt-4">
              <TimelineView 
                inspections={inspections}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}