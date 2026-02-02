import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        // In Next.js 15+, params is a Promise and must be awaited
        const { path: pathSegments } = await params

        // Resolve the file path: pathSegments will be ['incident', 'INC-0000x', 'filename.jpg']
        // Join them to get the relative path inside public/uploads/
        const relativePath = pathSegments.join('/')
        const absolutePath = path.join(process.cwd(), 'public', 'uploads', relativePath)

        // Security check: ensure path is within uploads directory
        if (!absolutePath.startsWith(path.join(process.cwd(), 'public', 'uploads'))) {
            return new NextResponse('Forbidden', { status: 403 })
        }

        if (!fs.existsSync(absolutePath)) {
            console.error(`File not found: ${absolutePath}`)
            return new NextResponse('File Not Found', { status: 404 })
        }

        const fileBuffer = fs.readFileSync(absolutePath)

        // Determine content type based on extension
        const ext = path.extname(absolutePath).toLowerCase()
        const mimeTypes: { [key: string]: string } = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.pdf': 'application/pdf',
            '.txt': 'text/plain'
        }

        const contentType = mimeTypes[ext] || 'application/octet-stream'

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable'
            }
        })
    } catch (error) {
        console.error('PROVE VIEW ERROR:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
