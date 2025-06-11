// import { auth } from "./auth"

interface BusinessCentralConfig {
  baseUrl: string
  tenantId: string
  clientId: string
  clientSecret: string
  environment: string
  company: string
}

interface InspectionHeader {
  inspectionDate: string
  inspectionTime: string
  inspectorName: string
  salesOrderNo?: string
  purchaseOrderNo?: string
  salespersonCode?: string
  locationCode?: string
  status?: string
  customFieldsJSON?: string
}

interface InspectionLine {
  inspectionNo: string
  lineNo?: number
  itemNo?: string
  partNo?: string
  description?: string
  quantity: number
  condition?: string
  brand?: string
  serialNo?: string
  
  // Tire-specific fields
  tireSectionWidth?: string
  tireAspectRatio?: string
  tireRimDiameter?: string
  tireTreadDepth?: string
  tireOverallDiameter?: string
  tirePlyRating?: string
  tireTubeless?: boolean
  tireTreadPattern?: string
  
  // General condition fields
  overallCondition?: string
  weight?: string
  photoReferences?: string
  notes?: string
  customFieldsJSON?: string
}

class BusinessCentralClient {
  private config: BusinessCentralConfig
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor() {
    this.config = {
      baseUrl: process.env.BC_BASE_URL || 'https://api.businesscentral.dynamics.com',
      tenantId: process.env.BC_TENANT_ID!,
      clientId: process.env.BC_CLIENT_ID!,
      clientSecret: process.env.BC_CLIENT_SECRET!,
      environment: process.env.BC_ENVIRONMENT || 'BC_Sandbox',
      company: process.env.BC_COMPANY || 'CFI%20Tire'
    }
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken
    }

    const tokenUrl = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`
    
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      scope: 'https://api.businesscentral.dynamics.com/.default',
      grant_type: 'client_credentials'
    })

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    })

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.status}`)
    }

    const tokenData = await response.json()
    this.accessToken = tokenData.access_token
    this.tokenExpiry = new Date(Date.now() + (tokenData.expires_in - 60) * 1000) // 1 minute buffer

    return this.accessToken!
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const token = await this.getAccessToken()
      const url = `${this.config.baseUrl}/v2.0/${this.config.tenantId}/${this.config.environment}/ODataV4/Company('${this.config.company}')/${endpoint}`

      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.warn(`Business Central API error: ${response.status} - ${errorText}`)
        
        // Fall back to mock data only if BC API is disabled
        if (process.env.BC_DISABLE_API === 'true') {
          return this.getMockResponse<T>(endpoint, options.method || 'GET')
        }
        
        throw new Error(`Business Central API error: ${response.status} - ${errorText}`)
      }

      return response.json()
    } catch (error) {
      console.warn('Business Central request failed, falling back to mock data:', error)
      
      if (process.env.BC_DISABLE_API === 'true') {
        return this.getMockResponse<T>(endpoint, options.method || 'GET')
      }
      
      throw error
    }
  }

  private getMockResponse<T>(endpoint: string, method: string): T {
    console.log(`Mock response for ${method} ${endpoint}`)
    
    if (endpoint.includes('Nexus_Inspections_Header') && method === 'POST') {
      return {
        no: `INS${Date.now().toString().slice(-6)}`,
        inspectionType: '',
        status: 'Open',
        success: true
      } as unknown as T
    }
    
    if (endpoint.includes('Nexus_Inspections_Lines') && method === 'POST') {
      return {
        inspectionNo: `INS${Date.now().toString().slice(-6)}`,
        lineNo: 10000,
        success: true
      } as unknown as T
    }
    
    if (endpoint.includes('salesOrders')) {
      return {
        value: [
          {
            number: "SO001234",
            customerNumber: "CUST001",
            orderDate: "2024-06-08",
            status: "Open",
            salespersonCode: "JOHN"
          }
        ]
      } as unknown as T
    }
    
    if (endpoint.includes('Nexus_Inspections_List')) {
      return {
        value: [
          {
            inspectionNo: "INS001234",
            inspectionDate: "2024-06-08",
            inspectionTime: "10:30:00",
            inspectorName: "John Smith",
            salesOrderNo: "SO001234",
            purchaseOrderNo: "PO005678",
            salespersonCode: "JOHN",
            locationCode: "MAIN",
            status: "Open"
          },
          {
            inspectionNo: "INS001235",
            inspectionDate: "2024-06-07",
            inspectionTime: "14:15:00",
            inspectorName: "Sarah Johnson",
            salesOrderNo: "SO001235",
            salespersonCode: "SARAH",
            locationCode: "SHOP",
            status: "Completed"
          },
          {
            inspectionNo: "INS001236",
            inspectionDate: "2024-06-06",
            inspectionTime: "09:00:00",
            inspectorName: "Mike Wilson",
            purchaseOrderNo: "PO005679",
            salespersonCode: "MIKE",
            locationCode: "YARD",
            status: "In Progress"
          }
        ]
      } as unknown as T
    }
    
    return { value: [] } as unknown as T
  }

  // Inspection Header methods
  async createInspectionHeader(inspection: InspectionHeader): Promise<any> {
    return this.request('Nexus_Inspections_Header', {
      method: 'POST',
      body: JSON.stringify(inspection),
    })
  }

  async getInspectionHeaders(filter?: string): Promise<any> {
    const endpoint = filter 
      ? `Nexus_Inspections_List?$filter=${encodeURIComponent(filter)}`
      : 'Nexus_Inspections_List'
    
    return this.request(endpoint)
  }

  async getInspectionHeader(inspectionNo: string): Promise<any> {
    return this.request(`Nexus_Inspections_Header(no='${inspectionNo}')`)
  }

  async updateInspectionHeader(inspectionNo: string, inspection: Partial<InspectionHeader>): Promise<any> {
    return this.request(`Nexus_Inspections_Header(no='${inspectionNo}')`, {
      method: 'PATCH',
      body: JSON.stringify(inspection),
    })
  }

  // Inspection Line methods
  async createInspectionLine(line: InspectionLine): Promise<any> {
    return this.request('Nexus_Inspections_Lines', {
      method: 'POST',
      body: JSON.stringify(line),
    })
  }

  async getInspectionLines(inspectionNo: string): Promise<any> {
    return this.request(`Nexus_Inspections_Lines?$filter=inspectionNo eq '${inspectionNo}'`)
  }

  async updateInspectionLine(inspectionNo: string, lineNo: number, line: Partial<InspectionLine>): Promise<any> {
    return this.request(`Nexus_Inspections_Lines(inspectionNo='${inspectionNo}',lineNo=${lineNo})`, {
      method: 'PATCH',
      body: JSON.stringify(line),
    })
  }

  // Sales Order methods - using standard Business Central endpoints
  async getSalesOrders(): Promise<any> {
    return this.request('SalesOrder?$select=No,Order_Date,Sell_to_Customer_Name,Salesperson_Code,Status')
  }

  async getSalesOrdersForShipments(): Promise<any> {
    const fields = [
      'No', 'Status', 'Completely_Shipped', 'Wharehouse_Shipment_Created',
      'Ship_to_Address', 'Ship_to_City', 'Ship_to_County', 'Ship_to_Post_Code',
      'Location_Code', 'Responsibility_Center', 'Order_Date', 'Shipment_Date',
      'Due_Date', 'Requested_Delivery_Date', 'Promised_Delivery_Date',
      'Shipping_Agent_Code', 'Shipping_Agent_Service_Code', 'Package_Tracking_No',
      'Shipment_Method_Code', 'Sell_to_Customer_Name', 'Salesperson_Code'
    ].join(',')
    
    return this.request(`SalesOrder?$select=${fields}&$filter=Status eq 'Released'`)
  }

  async getSalesOrder(soNumber: string): Promise<any> {
    return this.request(`SalesOrder('${soNumber}')?$expand=SalesOrderLines`)
  }

  // Purchase Order methods
  async getPurchaseOrders(): Promise<any> {
    return this.request('PurchaseOrder?$select=No,Order_Date,Buy_from_Vendor_Name')
  }

  // Salesperson methods
  async getSalespersons(): Promise<any> {
    return this.request('SalespersonPurchaser?$select=Code,Name')
  }

  // Location methods
  async getLocations(): Promise<any> {
    try {
      return this.request('Nexus_Locations?$select=Code,Name,Address,City')
    } catch (error) {
      // Fall back to mock locations if BC API fails
      return {
        value: [
          { Code: "MAIN", Name: "Main Warehouse", Address: "123 Industrial Blvd", City: "Edmonton" },
          { Code: "SHOP", Name: "Service Shop", Address: "456 Service Road", City: "Edmonton" },
          { Code: "YARD", Name: "Storage Yard", Address: "789 Storage Lane", City: "Edmonton" },
          { Code: "MOBILE", Name: "Mobile Service Unit", Address: "Various Locations", City: "Edmonton" }
        ]
      }
    }
  }

  // Shipment methods
  async getShipments(date?: string): Promise<any> {
    const endpoint = date 
      ? `Nexus_Shipments?$filter=shipmentDate eq '${date}'`
      : 'Nexus_Shipments'
    
    try {
      return this.request(endpoint)
    } catch (error) {
      // Mock shipment data for development
      return {
        value: [
          {
            shipmentNo: "SHIP001",
            shipmentDate: date || "2024-06-11",
            salesOrderNo: "SO001234",
            customerName: "ABC Transport",
            destinationAddress: "456 Delivery St, Calgary, AB",
            destinationLatitude: 51.0447,
            destinationLongitude: -114.0719,
            estimatedDeliveryDate: "2024-06-12",
            actualDeliveryDate: null,
            status: "In Transit",
            trackingNumber: "TRK001234",
            carrierCode: "UPS",
            totalWeight: 2500.0,
            totalValue: 15000.0
          },
          {
            shipmentNo: "SHIP002",
            shipmentDate: date || "2024-06-11",
            salesOrderNo: "SO001235",
            customerName: "XYZ Logistics",
            destinationAddress: "789 Industrial Ave, Vancouver, BC",
            destinationLatitude: 49.2827,
            destinationLongitude: -123.1207,
            estimatedDeliveryDate: "2024-06-13",
            actualDeliveryDate: "2024-06-13",
            status: "Delivered",
            trackingNumber: "TRK001235",
            carrierCode: "FedEx",
            totalWeight: 1800.0,
            totalValue: 12000.0
          }
        ]
      }
    }
  }

  async getShipmentAnalytics(startDate?: string, endDate?: string): Promise<any> {
    const endpoint = startDate && endDate 
      ? `Nexus_Shipment_Analytics?$filter=date ge '${startDate}' and date le '${endDate}'`
      : 'Nexus_Shipment_Analytics'
    
    try {
      return this.request(endpoint)
    } catch (error) {
      // Mock analytics data
      return {
        value: {
          totalShipments: 245,
          onTimeDeliveries: 234,
          lateDeliveries: 11,
          onTimePercentage: 95.5,
          averageDeliveryTime: 2.3,
          totalValue: 2450000.0,
          totalWeight: 185000.0,
          carrierPerformance: [
            { carrier: "UPS", onTimePercentage: 97.2, totalShipments: 120 },
            { carrier: "FedEx", onTimePercentage: 94.8, totalShipments: 85 },
            { carrier: "Purolator", onTimePercentage: 92.5, totalShipments: 40 }
          ],
          monthlyTrends: [
            { month: "Jan", onTimePercentage: 94.2, totalShipments: 198 },
            { month: "Feb", onTimePercentage: 95.1, totalShipments: 210 },
            { month: "Mar", onTimePercentage: 96.3, totalShipments: 225 },
            { month: "Apr", onTimePercentage: 95.8, totalShipments: 232 },
            { month: "May", onTimePercentage: 95.5, totalShipments: 245 }
          ]
        }
      }
    }
  }

  // Inspection Type methods
  async getInspectionTypes(): Promise<any> {
    return this.request('api/cfisolutions/cfi/v1.0/inspectionTypes')
  }
}

// Singleton instance
export const bcClient = new BusinessCentralClient()

// Helper functions for form processing
export function mapFormDataToInspectionHeader(formData: Record<string, string>, inspectionType?: string): any {
  const customFields: Record<string, string> = {}
  const standardFields = [
    'dateTime', 'date', 'inspectorName', 'soNo', 'poNo', 'salesperson', 'location',
    'partNo', 'quantity', 'condition', 'brand', 'description', 'serialNo'
  ]

  // Separate custom fields from standard fields
  Object.entries(formData).forEach(([key, value]) => {
    if (!standardFields.includes(key) && value) {
      customFields[key] = value
    }
  })

  // Use either dateTime or date field
  const dateTimeValue = formData.dateTime || formData.date
  const dateTime = dateTimeValue ? new Date(dateTimeValue) : new Date()
  
  // Create header object using exact BC field names
  const headerData: any = {
    inspectionDate: dateTime.toISOString().split('T')[0],
    inspectionTime: dateTime.toTimeString().split(' ')[0], // Format as HH:MM:SS
    inspectorName: formData.inspectorName || '',
    status: 'Open'
  }
  
  // Add inspection type if provided
  if (inspectionType) {
    headerData.inspectionType = inspectionType
  }
  
  // Only add optional fields if they have values (using exact BC field names)
  if (formData.soNo) headerData.salesOrderNo = formData.soNo
  if (formData.poNo) headerData.purchaseOrderNo = formData.poNo
  if (formData.salesperson) headerData.salespersonCode = formData.salesperson
  if (formData.location) headerData.locationCode = formData.location
  if (Object.keys(customFields).length > 0) {
    headerData.customFieldsJSON = JSON.stringify(customFields)
  }
  
  return headerData
}

export function mapFormDataToInspectionLine(formData: Record<string, string>, inspectionNo: string): any {
  const customFields: Record<string, string> = {}
  const standardFields = [
    'partNo', 'quantity', 'condition', 'brand', 'description', 'serialNo',
    'manufacturersPartNo', 'weight', 'overallTireCondition', 'notesOtherIssues',
    'productPhoto', 'sectionWidth', 'aspectRatio', 'rimDiameter', 'treadDepth'
  ]

  // Separate custom fields
  Object.entries(formData).forEach(([key, value]) => {
    if (!standardFields.includes(key) && value && 
        !['dateTime', 'date', 'inspectorName', 'soNo', 'poNo', 'salesperson', 'location'].includes(key)) {
      customFields[key] = value
    }
  })

  // Create line object using exact BC field names
  const lineData: any = {
    inspectionNo,
    quantity: parseInt(formData.quantity) || 1
  }

  // Only add fields that have values (using exact BC field names)
  if (formData.partNo) lineData.partNo = formData.partNo
  if (formData.partNo) lineData.itemNo = formData.partNo // Use partNo for itemNo as well
  if (formData.description) lineData.description = formData.description
  if (formData.condition) lineData.condition = formData.condition
  if (formData.brand) lineData.brand = formData.brand
  if (formData.serialNo) lineData.serialNo = formData.serialNo
  if (formData.weight) lineData.weight = formData.weight
  
  // Tire-specific fields using exact BC field names
  if (formData.sectionWidth) lineData.tireSectionWidth = formData.sectionWidth
  if (formData.aspectRatio) lineData.tireAspectRatio = formData.aspectRatio
  if (formData.rimDiameter) lineData.tireRimDiameter = formData.rimDiameter
  if (formData.treadDepth) lineData.tireTreadDepth = formData.treadDepth
  
  // Overall condition and notes
  if (formData.overallTireCondition || formData.overallCondition) {
    lineData.overallCondition = formData.overallTireCondition || formData.overallCondition
  }
  if (formData.notesOtherIssues) lineData.lineNotes = formData.notesOtherIssues
  
  // Custom fields
  if (Object.keys(customFields).length > 0) {
    lineData.customFieldsJSON = JSON.stringify(customFields)
  }
  
  return lineData
}