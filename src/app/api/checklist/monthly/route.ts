import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Checklist } from '@/models/Checklist'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month') || '')
    const year = parseInt(searchParams.get('year') || '')

    if (!month || !year || isNaN(month) || isNaN(year)) {
      return NextResponse.json(
        { error: 'Invalid month or year parameters' },
        { status: 400 }
      )
    }

    await connectDB()

    // Create date range for the query
    // Javascript months are 0-indexed (0=Jan, 11=Dec)
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59) // Last day of month

    const data = await Checklist.find({
      tgl: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ tgl: 1 }) // Sort by date ascending

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching monthly report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report data' },
      { status: 500 }
    )
  }
}
