import { NextResponse } from 'next/server'

export async function GET() {
  const response = NextResponse.json({})
  response.cookies.set('token', '', { maxAge: 0 })
  return response
}
