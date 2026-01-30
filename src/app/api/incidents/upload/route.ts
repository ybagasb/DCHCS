import { NextResponse } from 'next/server'
import { uploadFile } from '@/lib/minio'

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        if (!file) {
            return NextResponse.json({ message: 'No file uploaded' }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const incidentId = formData.get('incidentId') as string
        const prefix = incidentId ? `${incidentId}/` : ''
        const fileName = `${prefix}${Date.now()}-${file.name.replace(/\s+/g, '_')}`
        const contentType = file.type

        const result = await uploadFile(buffer, fileName, contentType)

        return NextResponse.json(result)
    } catch (error) {
        console.error('UPLOAD ERROR:', error)
        return NextResponse.json({ message: 'Error uploading file' }, { status: 500 })
    }
}
