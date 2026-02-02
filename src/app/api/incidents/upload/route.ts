import { NextResponse } from 'next/server'
import { saveLocalFile } from '@/lib/storage'

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        if (!file) {
            return NextResponse.json({ message: 'No file uploaded' }, { status: 400 })
        }

        const MAX_SIZE = 200 * 1024 * 1024 // 200MB
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ message: 'File too large (max 200MB)' }, { status: 413 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const incidentId = formData.get('incidentId') as string
        const prefix = incidentId ? incidentId : 'general'

        // Clean filename: remove special chars but keep extension
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const fileName = `${Date.now()}-${cleanName}`
        const fileType = file.type // Get MIME type

        console.log(`Saving file locally: ${fileName} for incident ${prefix}`)

        const result = await saveLocalFile(buffer, fileName, prefix, fileType)

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('UPLOAD ERROR:', error)
        return NextResponse.json({ message: 'Error uploading file locally' }, { status: 500 })
    }
}
