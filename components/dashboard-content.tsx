"use client"

import { useState, useEffect } from "react"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { InspectionDataTable } from "@/components/inspection-data-table"
import { SectionCards } from "@/components/section-cards"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface InspectionData {
  No: string
  Inspection_Date: string
  Inspector_Name: string
  Sales_Order_No?: string
  Customer_No?: string
  Customer_Name?: string
  Status?: string
  Location_Code?: string
  Inspection_Type?: string
  Inspection_Category?: string
}

interface DashboardContentProps {
  documentData: any[]
}

export function DashboardContent({ documentData }: DashboardContentProps) {
  const [inspectionData, setInspectionData] = useState<InspectionData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchInspections = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/inspections')
      if (response.ok) {
        const data = await response.json()
        // Handle both direct array response and Business Central OData response
        const inspections = data.value || data
        setInspectionData(Array.isArray(inspections) ? inspections : [])
      } else {
        console.error('Failed to fetch inspections:', response.statusText)
        setInspectionData([])
      }
    } catch (error) {
      console.error('Error fetching inspections:', error)
      setInspectionData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInspections()
  }, [])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          
          <Tabs defaultValue="inspections" className="w-full">
            <div className="px-4 lg:px-6">
              <TabsList>
                <TabsTrigger value="inspections">Inspections</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="inspections" className="mt-4">
              <InspectionDataTable 
                data={inspectionData}
                isLoading={isLoading}
                onRefresh={fetchInspections}
              />
            </TabsContent>
            
            <TabsContent value="documents" className="mt-4">
              <DataTable data={documentData} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}