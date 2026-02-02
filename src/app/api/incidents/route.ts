import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Incident } from '@/models/Incident'

export const dynamic = 'force-dynamic'

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

        // Normalize and Redirect attachment URLs to our custom Viewing API
        const normalizedIncidents = incidents.map((inc: any) => {
            if (inc.attachments && Array.isArray(inc.attachments)) {
                inc.attachments = inc.attachments.map((att: any) => {
                    let newUrl = att.url
                    // Transform /uploads/incident/ or /uploads/incidents/ to /api/incidents/view/...
                    if (newUrl.startsWith('/uploads/')) {
                        newUrl = newUrl.replace('/uploads/', '/api/incidents/view/')
                    }
                    return { ...att, url: newUrl }
                })
            }
            return inc
        })

        console.log('GET /api/incidents - Success')

        return NextResponse.json(normalizedIncidents)
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
