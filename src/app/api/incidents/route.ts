import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Incident } from '@/models/Incident'
import { getPresignedUrl } from '@/lib/minio'

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

    if (searchParams.get('nextId') === 'true') {
        const nextId = await generateIncidentId()
        return NextResponse.json({ incidentId: nextId })
    }

    const incidents = await Incident.find(query).sort({ incidentId: 1 }).lean()

    // Regenerate presigned URLs for each attachment
    const incidentsWithUrls = await Promise.all(incidents.map(async (inc: any) => {
        if (inc.attachments && inc.attachments.length > 0) {
            const updatedAttachments = await Promise.all(inc.attachments.map(async (att: any) => {
                try {
                    const freshUrl = await getPresignedUrl(att.name)
                    return { ...att, url: freshUrl }
                } catch (err) {
                    console.error('Error generating presigned URL for', att.name, err)
                    return att
                }
            }))
            return { ...inc, attachments: updatedAttachments }
        }
        return inc
    }))

    return NextResponse.json(incidentsWithUrls)
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
