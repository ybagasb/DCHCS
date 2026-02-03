import { Schema, model, models } from 'mongoose'

const DatastoreSchema = new Schema(
    {
        name: { type: String, required: true, unique: true },
    },
    { timestamps: true }
)

export const Datastore = models.Datastore || model('Datastore', DatastoreSchema)
