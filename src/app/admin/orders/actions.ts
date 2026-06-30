'use server'

import { db } from '@/infrastructure/db/client'
import { order } from '@/infrastructure/db/schema'
import type { OrderStatus } from '@/infrastructure/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type { OrderStatus }

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await db.update(order).set({ status }).where(eq(order.id, id))
  revalidatePath('/admin/orders')
}
