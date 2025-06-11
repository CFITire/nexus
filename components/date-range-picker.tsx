"use client"

import * as React from "react"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { CalendarIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DateRange {
  from?: Date
  to?: Date
}

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  className?: string
}

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const handlePreset = (preset: string) => {
    const today = new Date()
    let range: DateRange | undefined

    switch (preset) {
      case "today":
        range = { from: today, to: today }
        break
      case "this-week":
        range = { 
          from: startOfWeek(today, { weekStartsOn: 1 }), // Monday
          to: endOfWeek(today, { weekStartsOn: 1 }) // Sunday
        }
        break
      case "this-month":
        range = { 
          from: startOfMonth(today), 
          to: endOfMonth(today) 
        }
        break
      default:
        range = undefined
    }

    onChange?.(range)
  }

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined
    onChange?.({ from: date, to: value?.to })
  }

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined
    onChange?.({ from: value?.from, to: date })
  }

  const handleClear = () => {
    onChange?.(undefined)
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Quick preset buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePreset("today")}
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePreset("this-week")}
        >
          This Week
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePreset("this-month")}
        >
          This Month
        </Button>
      </div>

      {/* Date inputs */}
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        <Input
          type="date"
          value={value?.from ? format(value.from, 'yyyy-MM-dd') : ''}
          onChange={handleFromDateChange}
          className="w-auto"
          placeholder="From"
        />
        <span className="text-muted-foreground">to</span>
        <Input
          type="date"
          value={value?.to ? format(value.to, 'yyyy-MM-dd') : ''}
          onChange={handleToDateChange}
          className="w-auto"
          placeholder="To"
        />
        {(value?.from || value?.to) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}