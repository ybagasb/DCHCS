import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Incident } from '@/models/Incident'

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB()
        const { id } = await params
        const body = await req.json()

        const updatedIncident = await Incident.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        })

        if (!updatedIncident) {
            return NextResponse.json({ message: 'Incident not found' }, { status: 404 })
        }

        return NextResponse.json(updatedIncident)
    } catch (error) {
        console.error('UPDATE INCIDENT ERROR:', error)
        return NextResponse.json(
            { message: 'Error updating incident' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB()
        const { id } = await params
        const deletedIncident = await Incident.findByIdAndDelete(id)

        if (!deletedIncident) {
            return NextResponse.json({ message: 'Incident not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Incident deleted successfully' })
    } catch (error) {
        console.error('DELETE INCIDENT ERROR:', error)
        return NextResponse.json(
            { message: 'Error deleting incident' },
            { status: 500 }
        )
    }
}
