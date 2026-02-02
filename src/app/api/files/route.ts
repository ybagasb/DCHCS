import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
    try {
        const downloadDir = process.env.DOWNLOAD_PATH || path.join(process.cwd(), 'data')

        if (!fs.existsSync(downloadDir)) {
            return NextResponse.json({ files: [] })
        }

        const files = fs.readdirSync(downloadDir)
        const fileList = files.map(file => {
            const stats = fs.statSync(path.join(downloadDir, file))
            const size = stats.size
            const sizeFormatted = formatBytes(size)
            return {
                name: file,
                size,
                sizeFormatted,
                url: `/api/download/${file}`
            }
        })

        return NextResponse.json({ files: fileList })
    } catch (error) {
        console.error('FILES API ERROR:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
