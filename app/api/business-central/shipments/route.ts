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
    const date = searchParams.get('date') // Legacy support
    
    // Get sales orders and transform to shipment format
    const salesOrdersResponse = await bcClient.getSalesOrdersForShipments()
    const salesOrders = salesOrdersResponse.value || []
    
    // Filter by date range if provided, otherwise show recent orders (last 7 days)
    let filteredOrders = salesOrders
    if (startDate && endDate) {
      // Date range filtering
      filteredOrders = salesOrders.filter((order: any) => {
        const shipmentDate = order.Shipment_Date
        const orderDate = order.Order_Date
        
        // Include orders with shipment date or order date within the range
        const shipmentMatches = shipmentDate && shipmentDate !== '0001-01-01' && 
                               shipmentDate >= startDate && 
                               shipmentDate <= endDate
        
        const orderMatches = orderDate && 
                           orderDate >= startDate && 
                           orderDate <= endDate
        
        return shipmentMatches || orderMatches
      })
    } else if (startDate) {
      // Single start date - show that day only
      filteredOrders = salesOrders.filter((order: any) => {
        const shipmentDate = order.Shipment_Date
        const orderDate = order.Order_Date
        
        const shipmentMatches = shipmentDate && shipmentDate !== '0001-01-01' && shipmentDate === startDate
        const orderMatches = orderDate && orderDate === startDate
        
        return shipmentMatches || orderMatches
      })
    } else if (date) {
      // Legacy single date support
      const targetDate = new Date(date)
      const dayBefore = new Date(targetDate)
      dayBefore.setDate(targetDate.getDate() - 1)
      const dayAfter = new Date(targetDate)
      dayAfter.setDate(targetDate.getDate() + 1)
      
      filteredOrders = salesOrders.filter((order: any) => {
        const shipmentDate = order.Shipment_Date
        const orderDate = order.Order_Date
        
        const shipmentMatches = shipmentDate && shipmentDate !== '0001-01-01' && 
                               shipmentDate >= dayBefore.toISOString().split('T')[0] && 
                               shipmentDate <= dayAfter.toISOString().split('T')[0]
        
        const orderMatches = orderDate && 
                           orderDate >= dayBefore.toISOString().split('T')[0] && 
                           orderDate <= dayAfter.toISOString().split('T')[0]
        
        return shipmentMatches || orderMatches
      })
    } else {
      // No date filter - show recent orders (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      
      filteredOrders = salesOrders.filter((order: any) => {
        const orderDate = order.Order_Date
        const shipmentDate = order.Shipment_Date
        
        // Show recent orders OR orders with valid shipment dates
        const isRecentOrder = orderDate && new Date(orderDate) >= sevenDaysAgo
        const hasValidShipmentDate = shipmentDate && shipmentDate !== '0001-01-01'
        
        return isRecentOrder || hasValidShipmentDate
      })
    }
    
    // Transform sales orders to shipment format
    const shipments = filteredOrders.map((order: any) => ({
      shipmentNo: order.No,
      shipmentDate: order.Shipment_Date,
      salesOrderNo: order.No,
      customerName: order.Sell_to_Customer_Name,
      destinationAddress: [
        order.Ship_to_Address,
        order.Ship_to_City,
        order.Ship_to_County,
        order.Ship_to_Post_Code
      ].filter(Boolean).join(', '),
      status: order.Completely_Shipped ? 'Delivered' : 
             order.Wharehouse_Shipment_Created ? 'In Transit' : 'Pending',
      trackingNumber: order.Package_Tracking_No || '',
      carrierCode: order.Shipping_Agent_Code || '',
      serviceCode: order.Shipping_Agent_Service_Code || '',
      shipmentMethod: order.Shipment_Method_Code || '',
      salespersonCode: order.Salesperson_Code || '',
      responsibilityCenter: order.Responsibility_Center || '',
      orderDate: order.Order_Date,
      dueDate: order.Due_Date,
      requestedDeliveryDate: order.Requested_Delivery_Date !== '0001-01-01' ? order.Requested_Delivery_Date : null,
      promisedDeliveryDate: order.Promised_Delivery_Date !== '0001-01-01' ? order.Promised_Delivery_Date : null
    }))
    
    return NextResponse.json({ value: shipments })
  } catch (error) {
    console.error('Error fetching shipments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shipments' },
      { status: 500 }
    )
  }
}