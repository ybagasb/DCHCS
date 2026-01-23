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
  console.log('--- API DEBUG ---')
  console.log('Received Body:', JSON.stringify(body, null, 2))
  
  // Debug: Check if Schema has raisedFloor
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schemaPaths = (Checklist.schema as any).paths
  console.log('Schema has raisedFloor?', !!schemaPaths['raisedFloor.status'])
  console.log('Schema path type for pac.temp:', schemaPaths['pac.temp']?.instance)

  const checklist = await Checklist.create(body)
  console.log('Created Data:', JSON.stringify(checklist, null, 2))
  console.log('-----------------')
  
  return NextResponse.json(checklist, { status: 201 })
}
