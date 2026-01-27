import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IIncident extends Document {
    incidentId: string // Auto-generated INC-XXXXX
    reportDate: Date
    reporter: string
    unit: string
    description: string
    area: string
    location: string
    category: 'High' | 'Medium' | 'Low'
    investigation?: string
    solution?: string
    completionDate?: Date
    pic?: string
    status: 'Open' | 'In Progress' | 'Closed'
    createdAt: Date
    updatedAt: Date
}

const IncidentSchema = new Schema<IIncident>(
    {
        incidentId: {
            type: String,
            required: true,
            unique: true,
        },
        reportDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        reporter: {
            type: String,
            required: true,
        },
        unit: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        area: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ['High', 'Medium', 'Low'],
            required: true,
        },
        investigation: {
            type: String,
        },
        solution: {
            type: String,
        },
        completionDate: {
            type: Date,
        },
        pic: {
            type: String,
        },
        status: {
            type: String,
            enum: ['Open', 'In Progress', 'Closed'],
            default: 'Open',
        },
    },
    {
        timestamps: true,
    }
)

export const Incident: Model<IIncident> = mongoose.models.Incident || mongoose.model<IIncident>('Incident', IncidentSchema)
