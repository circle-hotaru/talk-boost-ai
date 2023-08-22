import { NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export async function POST(req: Request) {
  const prisma = new PrismaClient()

  try {
    const { username: name, password, email } = await req.json()

    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const user = await prisma.user.create({
      data: {
        name,
        password: hashedPassword,
        email,
      },
    })

    const token = jwt.sign({ name: user.name }, process.env.JWT_SECRET)
    const response = NextResponse.json({ user }, { status: 201 })

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    })

    return response
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return NextResponse.json(
          {
            error: 'Username already exists',
          },
          { status: 409 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 500 }
      )
    }
  }
}
