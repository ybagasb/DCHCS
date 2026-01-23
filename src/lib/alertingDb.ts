import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env')
}

export const alertingConnection = mongoose.createConnection(MONGODB_URI, {
    dbName: 'alerting'
})
