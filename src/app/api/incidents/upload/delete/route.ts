import { NextResponse } from 'next/server'
import { deleteLocalFile } from '@/lib/storage'

export async function POST(req: Request) {
    try {
        const { url } = await req.json()

        if (!url) {
            return NextResponse.json({ message: 'URL is required' }, { status: 400 })
        }

        const success = await deleteLocalFile(url)

        if (success) {
            return NextResponse.json({ message: 'File deleted successfully' })
        } else {
            return NextResponse.json({ message: 'Failed to delete file' }, { status: 500 })
        }
    } catch (error: any) {
        console.error('DELETE ERROR:', error)
        return NextResponse.json({ message: 'Error deleting file' }, { status: 500 })
    }
}
