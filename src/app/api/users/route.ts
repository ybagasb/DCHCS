import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { hashPassword } from '@/lib/auth'

export async function GET() {
    await connectDB()
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    return NextResponse.json(users)
}

export async function POST(req: Request) {
    try {
        await connectDB()
        const body = await req.json()
        const { username, password, fullName } = body

        if (!username || !password) {
            return NextResponse.json(
                { message: 'Username and password are required' },
                { status: 400 }
            )
        }

        const existingUser = await User.findOne({ username })
        if (existingUser) {
            return NextResponse.json(
                { message: 'Username already exists' },
                { status: 400 }
            )
        }

        const hashedPassword = await hashPassword(password)
        const newUser = await User.create({
            username,
            password: hashedPassword,
            fullName,
            role: 'admin', // Enforce admin role
        })

        const userResponse = newUser.toObject()
        delete userResponse.password

        return NextResponse.json(userResponse, { status: 201 })
    } catch (error) {
        console.error('CREATE USER ERROR:', error)
        return NextResponse.json(
            { message: 'Error creating user' },
            { status: 500 }
        )
    }
}
