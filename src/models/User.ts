import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
    username: string
    password?: string // hashed
    role: 'admin'
    fullName?: string
    createdAt: Date
    updatedAt: Date
}

const UserSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: [true, 'Please provide a username'],
            unique: true,
            trim: true,
            minlength: [3, 'Username must be at least 3 characters'],
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [6, 'Password must be at least 6 characters'],
        },
        role: {
            type: String,
            enum: ['admin'],
            default: 'admin',
        },
        fullName: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
)

// Prevent overwriting model if already compiled
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
