"use client"

import { useDroppable } from "@dnd-kit/core"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface KanbanColumnProps {
  id: string
  title: string
  color: string
  count: number
  children: React.ReactNode
}

export function KanbanColumn({ id, title, color, count, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <Card className={`h-fit ${isOver ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{title}</h3>
          <Badge variant="outline" className={`text-xs ${color}`}>
            {count}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={setNodeRef}
          className="min-h-[200px] space-y-2"
        >
          {children}
        </div>
      </CardContent>
    </Card>
  )
}