import * as Minio from 'minio'

const endpoint = process.env.MINIO_ENDPOINT || 'localhost' // Use dummy for build-time evaluation

const minioClient = new Minio.Client({
    endPoint: endpoint,
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'dummy_key',
    secretKey: process.env.MINIO_SECRET_KEY || 'dummy_secret',
})

export const bucketName = process.env.MINIO_BUCKET || 'incident'

export async function uploadFile(file: Buffer, fileName: string, contentType: string) {
    console.log(`Uploading to MinIO - Bucket: ${bucketName}, File: ${fileName}, Endpoint: ${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`)
    await minioClient.putObject(bucketName, fileName, file, file.length, {
        'Content-Type': contentType,
    })

    // Generate a presigned URL that lasts for 7 days (maximum allowed by MinIO/S3 typically)
    const url = await minioClient.presignedGetObject(bucketName, fileName, 7 * 24 * 60 * 60)
    return { name: fileName, url, fileType: contentType }
}

export async function getPresignedUrl(fileName: string) {
    return await minioClient.presignedGetObject(bucketName, fileName, 7 * 24 * 60 * 60)
}

export default minioClient
