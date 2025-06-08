import { NextRequest, NextResponse } from 'next/server'
import { bcClient } from '@/lib/business-central'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inspectionNo = params.id
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Update inspection status in Business Central
    const result = await bcClient.updateInspectionHeader(inspectionNo, {
      status
    })

    return NextResponse.json({
      success: true,
      inspectionNo,
      status,
      result
    })

  } catch (error) {
    console.error('Error updating inspection status:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update inspection status', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inspectionNo = params.id
    
    const header = await bcClient.getInspectionHeader(inspectionNo)
    const lines = await bcClient.getInspectionLines(inspectionNo)
    
    return NextResponse.json({
      header,
      lines: lines.value || []
    })

  } catch (error) {
    console.error('Error fetching inspection:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch inspection', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}