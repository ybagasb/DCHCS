import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Checklist } from '@/models/Checklist'

export async function GET(req: Request) {
  await connectDB()
  const checklist = await Checklist.find().sort({ tgl: -1 })
  return NextResponse.json(checklist)
}

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  console.log('API Received Body:', body)
  const checklist = await Checklist.create(body)
  return NextResponse.json(checklist, { status: 201 })
}
