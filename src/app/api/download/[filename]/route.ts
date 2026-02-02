import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params
        // Use environment variable or default to 'data' folder in project root
        const downloadDir = process.env.DOWNLOAD_PATH || path.join(process.cwd(), 'data')
        const filePath = path.join(downloadDir, filename)

        // Security check: ensure path is within download directory
        if (!filePath.startsWith(downloadDir)) {
            return new NextResponse('Forbidden', { status: 403 })
        }

        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`)
            return new NextResponse('File Not Found', { status: 404 })
        }

        const stats = fs.statSync(filePath)
        const fileSize = stats.size
        const range = request.headers.get('range')

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-")
            const start = parseInt(parts[0], 10)
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
            const chunksize = (end - start) + 1
            const file = fs.createReadStream(filePath, { start, end })

            // Convert Node.js readable stream to Web readable stream for Next.js
            const stream = Readable.toWeb(file) as ReadableStream

            return new NextResponse(stream, {
                status: 206,
                headers: {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize.toString(),
                    'Content-Type': 'application/octet-stream',
                    'Content-Disposition': `attachment; filename="${filename}"`,
                },
            })
        } else {
            const file = fs.createReadStream(filePath)
            const stream = Readable.toWeb(file) as ReadableStream

            return new NextResponse(stream, {
                headers: {
                    'Content-Length': fileSize.toString(),
                    'Content-Type': 'application/octet-stream',
                    'Content-Disposition': `attachment; filename="${filename}"`,
                    'Accept-Ranges': 'bytes',
                },
            })
        }
    } catch (error) {
        console.error('DOWNLOAD API ERROR:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
