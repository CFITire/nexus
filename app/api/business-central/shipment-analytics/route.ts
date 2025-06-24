import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireModuleAccess } from '@/lib/rbac'
import { bcClient } from '@/lib/business-central'

export async function GET(request: Request) {
  try {
    // Check RBAC permissions - allow shipments, analytics, or admin access
    await requireModuleAccess(['shipments', 'analytics', 'admin'])
    
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    // Get sales orders with shipment data
    const salesOrdersResponse = await bcClient.getSalesOrdersForShipments()
    const salesOrders = salesOrdersResponse.value || []
    
    // Calculate analytics from sales order data
    const analytics = calculateShipmentAnalytics(salesOrders, startDate || undefined, endDate || undefined)
    
    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching shipment analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shipment analytics' },
      { status: 500 }
    )
  }
}

function calculateShipmentAnalytics(salesOrders: any[], startDate?: string, endDate?: string) {
  // Filter by date range if provided
  let filteredOrders = salesOrders
  if (startDate || endDate) {
    filteredOrders = salesOrders.filter((order: any) => {
      const orderDate = new Date(order.Order_Date)
      const start = startDate ? new Date(startDate) : new Date('1900-01-01')
      const end = endDate ? new Date(endDate) : new Date('2100-01-01')
      return orderDate >= start && orderDate <= end
    })
  }

  const totalShipments = filteredOrders.length
  const completedShipments = filteredOrders.filter((order: any) => order.Completely_Shipped).length
  const pendingShipments = totalShipments - completedShipments
  
  // Calculate on-time delivery performance
  const shipmentsWithDates = filteredOrders.filter((order: any) => 
    order.Shipment_Date && order.Due_Date && 
    order.Shipment_Date !== '0001-01-01' && order.Due_Date !== '0001-01-01'
  )
  
  const onTimeDeliveries = shipmentsWithDates.filter((order: any) => {
    const shipDate = new Date(order.Shipment_Date)
    const dueDate = new Date(order.Due_Date)
    return shipDate <= dueDate
  }).length
  
  const onTimePercentage = shipmentsWithDates.length > 0 
    ? (onTimeDeliveries / shipmentsWithDates.length) * 100 
    : 0

  // Calculate average delivery time
  const deliveryTimes = shipmentsWithDates.map((order: any) => {
    const orderDate = new Date(order.Order_Date)
    const shipDate = new Date(order.Shipment_Date)
    return Math.ceil((shipDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
  }).filter(days => days >= 0)
  
  const averageDeliveryTime = deliveryTimes.length > 0
    ? deliveryTimes.reduce((sum, days) => sum + days, 0) / deliveryTimes.length
    : 0

  // Carrier performance analysis
  const carrierStats = filteredOrders.reduce((acc: Record<string, { total: number, onTime: number }>, order: any) => {
    const carrier = order.Shipping_Agent_Code || 'Unknown'
    if (!acc[carrier]) {
      acc[carrier] = { total: 0, onTime: 0 }
    }
    acc[carrier].total++
    
    if (order.Shipment_Date && order.Due_Date && 
        order.Shipment_Date !== '0001-01-01' && order.Due_Date !== '0001-01-01') {
      const shipDate = new Date(order.Shipment_Date)
      const dueDate = new Date(order.Due_Date)
      if (shipDate <= dueDate) {
        acc[carrier].onTime++
      }
    }
    return acc
  }, {})

  const carrierPerformance = Object.entries(carrierStats).map(([carrier, stats]: [string, { total: number, onTime: number }]) => ({
    carrier,
    onTimePercentage: stats.total > 0 ? (stats.onTime / stats.total) * 100 : 0,
    totalShipments: stats.total
  }))

  // Monthly trends (last 6 months)
  const monthlyTrends = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
    
    const monthOrders = filteredOrders.filter((order: any) => {
      const orderDate = new Date(order.Order_Date)
      return orderDate >= monthStart && orderDate <= monthEnd
    })
    
    const monthOnTime = monthOrders.filter((order: any) => {
      if (!order.Shipment_Date || !order.Due_Date || 
          order.Shipment_Date === '0001-01-01' || order.Due_Date === '0001-01-01') {
        return false
      }
      const shipDate = new Date(order.Shipment_Date)
      const dueDate = new Date(order.Due_Date)
      return shipDate <= dueDate
    }).length
    
    monthlyTrends.push({
      month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
      onTimePercentage: monthOrders.length > 0 ? (monthOnTime / monthOrders.length) * 100 : 0,
      totalShipments: monthOrders.length
    })
  }

  // Calculate total value and weight
  const totalValue = filteredOrders.reduce((sum, order) => {
    const amount = parseFloat(order.Amount) || 0
    return sum + amount
  }, 0)

  const totalWeight = filteredOrders.reduce((sum, order) => {
    // Assuming weight might be in a field like Gross_Weight or similar
    // Using Amount as a proxy for now since weight field might not be available
    const weight = parseFloat(order.Gross_Weight) || 0
    return sum + weight
  }, 0)

  return {
    value: {
      totalShipments,
      completedShipments,
      pendingShipments,
      onTimeDeliveries,
      lateDeliveries: shipmentsWithDates.length - onTimeDeliveries,
      onTimePercentage: Math.round(onTimePercentage * 10) / 10,
      averageDeliveryTime: Math.round(averageDeliveryTime * 10) / 10,
      totalValue: Math.round(totalValue * 100) / 100,
      totalWeight: Math.round(totalWeight * 100) / 100,
      carrierPerformance,
      monthlyTrends,
      lastUpdated: new Date().toISOString()
    }
  }
}