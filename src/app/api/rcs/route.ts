import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Rcs } from '@/models/Rcs'

export async function GET(request: Request) {
    try {
        await connectDB()
        const { searchParams } = new URL(request.url)
        const month = searchParams.get('month') // Expected format YYYY-MM

        let query = {}
        if (month) {
            const [year, m] = month.split('-')
            const startDate = new Date(parseInt(year), parseInt(m) - 1, 1)
            const endDate = new Date(parseInt(year), parseInt(m), 0, 23, 59, 59)
            query = { tgl: { $gte: startDate, $lte: endDate } }
        }

        const entries = await Rcs.find(query).sort({ tgl: -1 })
        return NextResponse.json(entries)
    } catch (error) {
        console.error('Error fetching RCS entries:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        await connectDB()
        const data = await request.json()
        const entry = await Rcs.create(data)
        return NextResponse.json(entry, { status: 201 })
    } catch (error) {
        console.error('Error creating RCS entry:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
