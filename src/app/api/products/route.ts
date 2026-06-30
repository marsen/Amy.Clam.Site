import { NextResponse } from 'next/server'
import { db } from '@/infrastructure/db/client'
import { product } from '@/infrastructure/db/schema'
import { eq, asc } from 'drizzle-orm'

export async function GET() {
  const products = await db.select({
    id: product.id,
    name: product.name,
    price: product.price,
  }).from(product).where(eq(product.isActive, true)).orderBy(asc(product.createdAt))
  return NextResponse.json(products)
}
