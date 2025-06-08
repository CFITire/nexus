"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconCalendar, IconUser, IconBuilding } from "@tabler/icons-react"

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

interface InspectionCardProps {
  inspection: InspectionData
  isDragging?: boolean
}

export function InspectionCard({ inspection, isDragging = false }: InspectionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: inspection.No,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${
        isDragging || isSortableDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="font-mono text-sm font-medium">
            {inspection.No}
          </div>
          {inspection.Inspection_Type && (
            <Badge variant="outline" className="text-xs">
              {inspection.Inspection_Type}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <IconCalendar className="size-3" />
          <span>{formatDate(inspection.Inspection_Date)}</span>
        </div>
        
        {inspection.Inspector_Name && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconUser className="size-3" />
            <span className="truncate">{inspection.Inspector_Name}</span>
          </div>
        )}
        
        {inspection.Customer_Name && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconBuilding className="size-3" />
            <span className="truncate">{inspection.Customer_Name}</span>
          </div>
        )}
        
        {inspection.Sales_Order_No && (
          <div className="text-xs text-muted-foreground">
            SO: {inspection.Sales_Order_No}
          </div>
        )}
        
        {inspection.Location_Code && (
          <Badge variant="outline" className="text-xs w-fit">
            {inspection.Location_Code}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}