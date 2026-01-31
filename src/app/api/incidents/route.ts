import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Incident } from '@/models/Incident'

const generateIncidentId = async () => {
    const lastIncident = await Incident.findOne().sort({ incidentId: -1 })
    if (!lastIncident) return 'INC-00001'

    const lastId = lastIncident.incidentId
    const numberPart = parseInt(lastId.split('-')[1])
    const nextNumber = numberPart + 1
    return `INC-${nextNumber.toString().padStart(5, '0')}`
}

export async function GET(req: Request) {
    console.log('GET /api/incidents - Start')
    try {
        await connectDB()
        console.log('GET /api/incidents - DB Connected')
        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')

        const query: any = {}
        if (status) query.status = status

        if (searchParams.get('nextId') === 'true') {
            const nextId = await generateIncidentId()
            return NextResponse.json({ incidentId: nextId })
        }

        console.log('GET /api/incidents - Fetching from DB...')
        const incidents = await Incident.find(query).sort({ incidentId: 1 }).lean()
        console.log(`GET /api/incidents - Found ${incidents.length} incidents`)

        // attachments already contain the relative URL (e.g. /uploads/...)
        // No need to regenerate presigned URLs as we are using local storage.

        console.log('GET /api/incidents - Success')

        return NextResponse.json(incidents)
    } catch (error) {
        console.error('GET INCIDENTS ERROR:', error)
        return NextResponse.json({ message: 'Error fetching incidents' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        await connectDB()
        const body = await req.json()

        // Auto-generate ID
        const incidentId = await generateIncidentId()

        const newIncident = await Incident.create({
            ...body,
            incidentId,
        })

        return NextResponse.json(newIncident, { status: 201 })
    } catch (error) {
        console.error('CREATE INCIDENT ERROR:', error)
        return NextResponse.json(
            { message: 'Error creating incident' },
            { status: 500 }
        )
    }
}
