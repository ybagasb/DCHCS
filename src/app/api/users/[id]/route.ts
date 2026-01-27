import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { hashPassword } from '@/lib/auth'

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB()
        const { id } = await params
        const body = await req.json()
        const { username, password, fullName } = body

        const user = await User.findById(id)
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username })
            if (existingUser) {
                return NextResponse.json(
                    { message: 'Username already taken' },
                    { status: 400 }
                )
            }
            user.username = username
        }

        if (password) {
            user.password = await hashPassword(password)
        }

        if (fullName !== undefined) {
            user.fullName = fullName
        }

        await user.save()

        const userResponse = user.toObject()
        delete userResponse.password

        return NextResponse.json(userResponse)
    } catch (error) {
        console.error('UPDATE USER ERROR:', error)
        return NextResponse.json(
            { message: 'Error updating user' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB()
        const { id } = await params
        const deletedUser = await User.findByIdAndDelete(id)

        if (!deletedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'User deleted successfully' })
    } catch (error) {
        console.error('DELETE USER ERROR:', error)
        return NextResponse.json(
            { message: 'Error deleting user' },
            { status: 500 }
        )
    }
}
