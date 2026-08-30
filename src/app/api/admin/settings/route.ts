import { NextRequest, NextResponse } from 'next/server'
import { settings } from '@/lib/data/mock-store'

export async function GET() {
  return NextResponse.json(settings)
}

export async function PATCH(req: NextRequest) {
  const body: Record<string, string> = await req.json()
  for (const [key, value] of Object.entries(body)) {
    settings[key] = value
  }
  return NextResponse.json(settings)
}
