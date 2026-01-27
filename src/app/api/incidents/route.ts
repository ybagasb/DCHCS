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
    await connectDB()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const query: any = {}
    if (status) query.status = status

    const incidents = await Incident.find(query).sort({ incidentId: 1 })
    return NextResponse.json(incidents)
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
