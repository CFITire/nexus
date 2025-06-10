"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "An interactive area chart"

const chartData = [
  { date: "2024-04-01", open: 222, closed: 150 },
  { date: "2024-04-02", open: 97, closed: 180 },
  { date: "2024-04-03", open: 167, closed: 120 },
  { date: "2024-04-04", open: 242, closed: 260 },
  { date: "2024-04-05", open: 373, closed: 290 },
  { date: "2024-04-06", open: 301, closed: 340 },
  { date: "2024-04-07", open: 245, closed: 180 },
  { date: "2024-04-08", open: 409, closed: 320 },
  { date: "2024-04-09", open: 59, closed: 110 },
  { date: "2024-04-10", open: 261, closed: 190 },
  { date: "2024-04-11", open: 327, closed: 350 },
  { date: "2024-04-12", open: 292, closed: 210 },
  { date: "2024-04-13", open: 342, closed: 380 },
  { date: "2024-04-14", open: 137, closed: 220 },
  { date: "2024-04-15", open: 120, closed: 170 },
  { date: "2024-04-16", open: 138, closed: 190 },
  { date: "2024-04-17", open: 446, closed: 360 },
  { date: "2024-04-18", open: 364, closed: 410 },
  { date: "2024-04-19", open: 243, closed: 180 },
  { date: "2024-04-20", open: 89, closed: 150 },
  { date: "2024-04-21", open: 137, closed: 200 },
  { date: "2024-04-22", open: 224, closed: 170 },
  { date: "2024-04-23", open: 138, closed: 230 },
  { date: "2024-04-24", open: 387, closed: 290 },
  { date: "2024-04-25", open: 215, closed: 250 },
  { date: "2024-04-26", open: 75, closed: 130 },
  { date: "2024-04-27", open: 383, closed: 420 },
  { date: "2024-04-28", open: 122, closed: 180 },
  { date: "2024-04-29", open: 315, closed: 240 },
  { date: "2024-04-30", open: 454, closed: 380 },
  { date: "2024-05-01", open: 165, closed: 220 },
  { date: "2024-05-02", open: 293, closed: 310 },
  { date: "2024-05-03", open: 247, closed: 190 },
  { date: "2024-05-04", open: 385, closed: 420 },
  { date: "2024-05-05", open: 481, closed: 390 },
  { date: "2024-05-06", open: 498, closed: 520 },
  { date: "2024-05-07", open: 388, closed: 300 },
  { date: "2024-05-08", open: 149, closed: 210 },
  { date: "2024-05-09", open: 227, closed: 180 },
  { date: "2024-05-10", open: 293, closed: 330 },
  { date: "2024-05-11", open: 335, closed: 270 },
  { date: "2024-05-12", open: 197, closed: 240 },
  { date: "2024-05-13", open: 197, closed: 160 },
  { date: "2024-05-14", open: 448, closed: 490 },
  { date: "2024-05-15", open: 473, closed: 380 },
  { date: "2024-05-16", open: 338, closed: 400 },
  { date: "2024-05-17", open: 499, closed: 420 },
  { date: "2024-05-18", open: 315, closed: 350 },
  { date: "2024-05-19", open: 235, closed: 180 },
  { date: "2024-05-20", open: 177, closed: 230 },
  { date: "2024-05-21", open: 82, closed: 140 },
  { date: "2024-05-22", open: 81, closed: 120 },
  { date: "2024-05-23", open: 252, closed: 290 },
  { date: "2024-05-24", open: 294, closed: 220 },
  { date: "2024-05-25", open: 201, closed: 250 },
  { date: "2024-05-26", open: 213, closed: 170 },
  { date: "2024-05-27", open: 420, closed: 460 },
  { date: "2024-05-28", open: 233, closed: 190 },
  { date: "2024-05-29", open: 78, closed: 130 },
  { date: "2024-05-30", open: 340, closed: 280 },
  { date: "2024-05-31", open: 178, closed: 230 },
  { date: "2024-06-01", open: 178, closed: 200 },
  { date: "2024-06-02", open: 470, closed: 410 },
  { date: "2024-06-03", open: 103, closed: 160 },
  { date: "2024-06-04", open: 439, closed: 380 },
  { date: "2024-06-05", open: 88, closed: 140 },
  { date: "2024-06-06", open: 294, closed: 250 },
  { date: "2024-06-07", open: 323, closed: 370 },
  { date: "2024-06-08", open: 385, closed: 320 },
  { date: "2024-06-09", open: 438, closed: 480 },
  { date: "2024-06-10", open: 155, closed: 200 },
  { date: "2024-06-11", open: 92, closed: 150 },
  { date: "2024-06-12", open: 492, closed: 420 },
  { date: "2024-06-13", open: 81, closed: 130 },
  { date: "2024-06-14", open: 426, closed: 380 },
  { date: "2024-06-15", open: 307, closed: 350 },
  { date: "2024-06-16", open: 371, closed: 310 },
  { date: "2024-06-17", open: 475, closed: 520 },
  { date: "2024-06-18", open: 107, closed: 170 },
  { date: "2024-06-19", open: 341, closed: 290 },
  { date: "2024-06-20", open: 408, closed: 450 },
  { date: "2024-06-21", open: 169, closed: 210 },
  { date: "2024-06-22", open: 317, closed: 270 },
  { date: "2024-06-23", open: 480, closed: 530 },
  { date: "2024-06-24", open: 132, closed: 180 },
  { date: "2024-06-25", open: 141, closed: 190 },
  { date: "2024-06-26", open: 434, closed: 380 },
  { date: "2024-06-27", open: 448, closed: 490 },
  { date: "2024-06-28", open: 149, closed: 200 },
  { date: "2024-06-29", open: 103, closed: 160 },
  { date: "2024-06-30", open: 446, closed: 400 },
]

const chartConfig = {
  cases: {
    label: "Cases",
  },
  open: {
    label: "Open",
    color: "var(--primary)",
  },
  closed: {
    label: "Completed",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Open vs Completed</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillOpen" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-open)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-open)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillClosed" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-closed)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-closed)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="closed"
              type="natural"
              fill="url(#fillClosed)"
              stroke="var(--color-closed)"
              stackId="a"
            />
            <Area
              dataKey="open"
              type="natural"
              fill="url(#fillOpen)"
              stroke="var(--color-open)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
