import { Schema, model, models } from 'mongoose'

const RcsSchema = new Schema(
    {
        tgl: { type: Date, required: true },
        piket: { type: String, default: '' },
        cpu: {
            capacity: { type: Number, default: 0 },
            free: { type: Number, default: 0 },
            used: { type: Number, default: 0 },
            unit: { type: String, default: 'GHz' }
        },
        memory: {
            capacity: { type: Number, default: 0 },
            free: { type: Number, default: 0 },
            used: { type: Number, default: 0 },
            unit: { type: String, default: 'GB' }
        },
        storage: {
            universal: {
                capacity: { type: Number, default: 0 },
                free: { type: Number, default: 0 },
                used: { type: Number, default: 0 },
                unit: { type: String, default: 'TB' }
            },
            datastores: [
                {
                    name: { type: String, required: true },
                    capacity: { type: Number, default: 0 },
                    free: { type: Number, default: 0 },
                    used: { type: Number, default: 0 },
                    unit: { type: String, default: 'GB' }
                }
            ]
        },
        notes: { type: String, default: '' }
    },
    { timestamps: true }
)

// Prevent Mongoose model recompilation error in development
if (process.env.NODE_ENV !== 'production') {
    delete models.Rcs
}

export const Rcs = models.Rcs || model('Rcs', RcsSchema)
