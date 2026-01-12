import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Link } from '@/models/Link'

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB()

  const { id } = await context.params
  const { title, url, icon } = await req.json()

  await Link.findByIdAndUpdate(id, {
    title,
    url,
    icon,
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB()

  const { id } = await context.params

  await Link.findByIdAndDelete(id)

  return NextResponse.json({ success: true })
}