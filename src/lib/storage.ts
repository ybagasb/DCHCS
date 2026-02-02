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

    // Return relative URL for frontend (using Proxy API instead of direct uploads path)
    const relativeUrl = `/api/incidents/view/incident/${incidentId}/${fileName}`

    return {
        name: fileName,
        url: relativeUrl,
        fileType: fileType // use passed mime type
    }
}

export async function deleteLocalFile(relativeUrl: string) {
    try {
        // Normalize URL if it comes from our Proxy API
        let normalizedPath = relativeUrl
        if (normalizedPath.startsWith('/api/incidents/view/')) {
            normalizedPath = normalizedPath.replace('/api/incidents/view/', '/uploads/')
        }

        // Ensure the URL is relative and starts with sanctioned paths
        if (!normalizedPath.startsWith('/uploads/incident/') && !normalizedPath.startsWith('/uploads/incidents/')) {
            throw new Error('Invalid file path for deletion')
        }

        const absolutePath = path.join(process.cwd(), 'public', normalizedPath)

        try {
            // Check if file exists before trying to delete
            await fs.access(absolutePath)
            await fs.unlink(absolutePath)
            console.log(`Deleted file: ${absolutePath}`)
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                console.warn(`File already missing, skipping physical deletion: ${absolutePath}`)
                return true // Return true so the UI/DB update can proceed
            }
            throw error // Rethrow other errors
        }

        return true
    } catch (error: any) {
        console.error(`Error deleting file: ${relativeUrl}`, error)
        return false
    }
}
