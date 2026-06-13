import { NextResponse } from 'next/server'
import { prisma } from '@/infrastructure/prisma/client'

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, price: true },
  })
  return NextResponse.json(products)
}
