"use client"

import { useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { KanbanColumn } from "@/components/kanban-column"
import { InspectionCard } from "@/components/inspection-card"
import { Badge } from "@/components/ui/badge"
import { IconLoader } from "@tabler/icons-react"

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

interface KanbanBoardProps {
  inspections: InspectionData[]
  onStatusUpdate: (inspectionNo: string, newStatus: string) => void
  isLoading: boolean
}

const statusColumns = [
  {
    id: "Open",
    title: "Open",
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
  },
  {
    id: "In Progress", 
    title: "In Progress",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
  },
  {
    id: "Completed",
    title: "Completed", 
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
  },
  {
    id: "Approved",
    title: "Approved",
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
  },
  {
    id: "Rejected",
    title: "Rejected",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
  },
  {
    id: "Cancelled",
    title: "Cancelled",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
  }
]

export function KanbanBoard({ inspections, onStatusUpdate, isLoading }: KanbanBoardProps) {
  const [activeInspection, setActiveInspection] = useState<InspectionData | null>(null)
  
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const inspection = inspections.find(i => i.No === event.active.id)
    setActiveInspection(inspection || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveInspection(null)

    if (!over) return

    const inspectionId = active.id as string
    const newStatus = over.id as string
    const inspection = inspections.find(i => i.No === inspectionId)

    if (inspection && inspection.Status !== newStatus) {
      onStatusUpdate(inspectionId, newStatus)
    }
  }

  const getInspectionsByStatus = (status: string) => {
    return inspections.filter(inspection => inspection.Status === status || (!inspection.Status && status === "Open"))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <IconLoader className="animate-spin size-4" />
          Loading inspections...
        </div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statusColumns.map((column) => {
          const columnInspections = getInspectionsByStatus(column.id)
          
          return (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              count={columnInspections.length}
            >
              <SortableContext
                items={columnInspections.map(i => i.No)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {columnInspections.map((inspection) => (
                    <InspectionCard
                      key={inspection.No}
                      inspection={inspection}
                    />
                  ))}
                </div>
              </SortableContext>
            </KanbanColumn>
          )
        })}
      </div>

      <DragOverlay>
        {activeInspection ? (
          <InspectionCard inspection={activeInspection} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}