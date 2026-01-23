import { NextResponse } from 'next/server'
import PicSchedule from '@/models/PicSchedule'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      )
    }
    
    console.log(`Searching schedule for date: ${date}`)

    // Try to find by exact string match (data uses "YYYY-MM-DD")
    let schedule = await PicSchedule.findOne({ date })

    if (!schedule) {
      return NextResponse.json(
        { error: 'No schedule found for this date' },
        { status: 404 }
      )
    }

    // Map the pics array to a comma-separated string of names
    const picNames = schedule.pics && Array.isArray(schedule.pics) 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? schedule.pics.map((p: any) => p.name).join(', ')
        : ''

    return NextResponse.json({
      piket: picNames,
      shift: '' // Shift not explicitly in top level, maybe determine by time or just empty
    })

  } catch (error) {
    console.error('Error fetching PIC schedule:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
