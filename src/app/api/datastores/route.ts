import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Datastore } from '@/models/Datastore'

export async function GET() {
    try {
        await connectDB()
        const datastores = await Datastore.find({}).sort({ name: 1 })
        return NextResponse.json(datastores)
    } catch (error) {
        console.error('Error fetching datastores:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        await connectDB()
        const { name } = await request.json()
        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }
        const datastore = await Datastore.create({ name })
        return NextResponse.json(datastore, { status: 201 })
    } catch (error) {
        console.error('Error creating datastore:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        await connectDB()
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
        }
        await Datastore.findByIdAndDelete(id)
        return NextResponse.json({ message: 'Datastore deleted' })
    } catch (error) {
        console.error('Error deleting datastore:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
