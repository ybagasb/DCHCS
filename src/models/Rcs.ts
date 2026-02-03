import { Schema, model, models } from 'mongoose'

const RcsSchema = new Schema(
    {
        tgl: { type: Date, required: true },
        piket: { type: String, default: '' },
        cpu: {
            capacity: { type: Number, default: 0 },
            free: { type: Number, default: 0 },
            used: { type: Number, default: 0 }
        },
        memory: {
            capacity: { type: Number, default: 0 },
            free: { type: Number, default: 0 },
            used: { type: Number, default: 0 }
        },
        storage: {
            universal: {
                capacity: { type: Number, default: 0 },
                free: { type: Number, default: 0 },
                used: { type: Number, default: 0 }
            },
            datastores: [
                {
                    name: { type: String, required: true },
                    capacity: { type: Number, default: 0 },
                    free: { type: Number, default: 0 },
                    used: { type: Number, default: 0 }
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
