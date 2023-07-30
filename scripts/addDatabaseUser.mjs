import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // ... you will write your Prisma Client queries here
  const salt = bcrypt.genSaltSync(10)
  const hashedPassword = await bcrypt.hash('password123', salt)

  const user = await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'Alice@example.com',
      password: hashedPassword,
    },
  })
  console.log('User created successfully!\n', user)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
