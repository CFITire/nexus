import { NextRequest, NextResponse } from 'next/server'
import { bcClient, mapFormDataToInspectionHeader, mapFormDataToInspectionLine } from '@/lib/business-central'
import { requireModuleAccess } from '@/lib/rbac'

export async function POST(request: NextRequest) {
  try {
    // Check RBAC permissions
    await requireModuleAccess('inspections')
    
    const body = await request.json()
    const { formData, inspectionType } = body

    if (!formData) {
      return NextResponse.json(
        { error: 'Form data is required' },
        { status: 400 }
      )
    }

    // Create inspection header
    const headerData = mapFormDataToInspectionHeader(formData, inspectionType)
    console.log('Creating header with data:', headerData)
    const header = await bcClient.createInspectionHeader(headerData)
    console.log('Header created:', header)
    
    // Extract the inspection number from the response
    const inspectionNo = header.no || header.inspectionNo || header.No
    console.log('Header response:', JSON.stringify(header, null, 2))
    console.log('Using inspection number:', inspectionNo)
    
    if (!inspectionNo) {
      throw new Error('No inspection number returned from header creation')
    }
    
    // Create inspection line
    const lineData = mapFormDataToInspectionLine(formData, inspectionNo)
    console.log('Creating line with data:', lineData)
    const line = await bcClient.createInspectionLine(lineData)

    return NextResponse.json({
      success: true,
      inspectionNo,
      header,
      line
    })

  } catch (error) {
    console.error('Error creating inspection:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create inspection', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check RBAC permissions
    await requireModuleAccess('inspections')
    
    const { searchParams } = new URL(request.url)
    const inspectionNo = searchParams.get('inspectionNo')
    const filter = searchParams.get('filter')

    if (inspectionNo) {
      const header = await bcClient.getInspectionHeader(inspectionNo)
      const lines = await bcClient.getInspectionLines(inspectionNo)
      
      return NextResponse.json({
        header,
        lines: lines.value || []
      })
    } else {
      const headers = await bcClient.getInspectionHeaders(filter || undefined)
      return NextResponse.json(headers)
    }

  } catch (error) {
    console.error('Error fetching inspections:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch inspections', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}