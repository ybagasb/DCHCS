import fs from 'fs/promises'
import path from 'path'

export async function saveLocalFile(buffer: Buffer, fileName: string, incidentId: string, fileType: string) {
    // Define base upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'incident', incidentId)

    // Create directory if it doesn't exist
    await fs.mkdir(uploadDir, { recursive: true })

    // Define file path
    const filePath = path.join(uploadDir, fileName)

    // Write file
    await fs.writeFile(filePath, buffer)

    // Return relative URL for frontend
    const relativeUrl = `/uploads/incident/${incidentId}/${fileName}`

    return {
        name: fileName,
        url: relativeUrl,
        fileType: fileType // use passed mime type
    }
}

export async function deleteLocalFile(relativeUrl: string) {
    try {
        // Ensure the URL is relative and starts with /uploads/incident/ or /uploads/incidents/
        if (!relativeUrl.startsWith('/uploads/incident/') && !relativeUrl.startsWith('/uploads/incidents/')) {
            throw new Error('Invalid file path for deletion')
        }

        const absolutePath = path.join(process.cwd(), 'public', relativeUrl)

        // Check if file exists before trying to delete
        await fs.access(absolutePath)
        await fs.unlink(absolutePath)

        console.log(`Deleted file: ${absolutePath}`)
        return true
    } catch (error: any) {
        console.error(`Error deleting file: ${relativeUrl}`, error)
        return false
    }
}
