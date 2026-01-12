import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Link } from '@/models/Link'

export async function GET(req: Request) {
  await connectDB()

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')

  const query = q
    ? {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { url: { $regex: q, $options: 'i' } },
      ],
    }
    : {}

  const links = await Link.find(query).sort({ createdAt: -1 })
  return NextResponse.json(links)
}

export async function POST(req: Request) {
  await connectDB()

  const body = await req.json()
  const link = await Link.create(body)

  return NextResponse.json(link, { status: 201 })
}
