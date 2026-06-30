import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/infrastructure/db/client'
import { order, orderItem, product } from '@/infrastructure/db/schema'
import type { PickupLocation } from '@/infrastructure/db/schema'
import { eq, inArray, and, desc } from 'drizzle-orm'
import { z } from 'zod'
import { randomUUID } from 'crypto'

const PICKUP_SLOTS: Record<PickupLocation, string[]> = {
  SHINDIAN: ['08:00', '09:00', '10:00', '11:00', '12:00'],
  NEIHU: ['15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'],
}

const CreateOrderSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().regex(/^09\d{8}$/),
  pickupLocation: z.enum(['SHINDIAN', 'NEIHU']),
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pickupTime: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = CreateOrderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { customerName, customerPhone, pickupLocation, pickupDate, pickupTime, items } = parsed.data

  if (!PICKUP_SLOTS[pickupLocation].includes(pickupTime)) {
    return NextResponse.json({ error: '無效的取貨時間' }, { status: 400 })
  }

  const products = await db.select().from(product).where(
    and(inArray(product.id, items.map(i => i.productId)), eq(product.isActive, true))
  )
  if (products.length !== items.length) {
    return NextResponse.json({ error: '部分商品不存在或已下架' }, { status: 400 })
  }

  // 取得天氣快照
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let weatherSnapshot: any = null
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/api/weather`)
    const data = await res.json()
    const w = pickupLocation === 'SHINDIAN' ? data.shindian : data.neihu
    if (w) weatherSnapshot = { ...w, location: pickupLocation }
  } catch { /* 不阻斷下單 */ }

  const productMap = new Map(products.map(p => [p.id, p]))
  const orderItems = items.map(i => {
    const p = productMap.get(i.productId)!
    return { productId: p.id, productName: p.name, productPrice: p.price, quantity: i.quantity, subtotal: p.price * i.quantity }
  })
  const totalAmount = orderItems.reduce((s, i) => s + i.subtotal, 0)

  const orderId = randomUUID()
  await db.insert(order).values({
    id: orderId,
    customerName, customerPhone, pickupLocation, pickupDate, pickupTime,
    status: 'PENDING', totalAmount, weatherSnapshot,
  })
  await db.insert(orderItem).values(
    orderItems.map(item => ({ id: randomUUID(), orderId, ...item }))
  )

  const createdOrder = await db.query.order.findFirst({
    where: eq(order.id, orderId),
    with: { items: true },
  })

  return NextResponse.json(createdOrder, { status: 201 })
}

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone')
  if (!phone) return NextResponse.json({ error: '請提供電話' }, { status: 400 })

  const orders = await db.query.order.findMany({
    where: eq(order.customerPhone, phone),
    with: { items: true },
    orderBy: [desc(order.createdAt)],
  })
  return NextResponse.json(orders)
}
