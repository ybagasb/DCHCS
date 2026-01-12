import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(req: Request) {
  try {
    // ambil body
    const body = await req.json()
    const { email, password } = body

    // validasi input dasar
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email dan password wajib diisi' },
        { status: 400 }
      )
    }

    // ambil env
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    const jwtSecret = process.env.JWT_SECRET

    // safety check env
    if (!adminEmail || !adminPassword || !jwtSecret) {
      console.error('ENV TIDAK LENGKAP')
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 500 }
      )
    }

    // cek kredensial
    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json(
        { message: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // generate JWT
    const token = jwt.sign(
      {
        email,
        role: 'admin',
      },
      jwtSecret,
      {
        expiresIn: '1d',
      }
    )

    // response sukses
    const response = NextResponse.json({ success: true })

    // SET COOKIE (CARA BENAR DI APP ROUTER)
  response.cookies.set({
    name: 'token',
    value: token,
    httpOnly: true,
    path: '/',
    sameSite: 'strict',
  })

    return response
  } catch (error) {
    console.error('LOGIN ERROR:', error)

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
