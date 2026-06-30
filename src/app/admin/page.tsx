import Link from 'next/link'
import { db } from '@/infrastructure/db/client'
import { order, product } from '@/infrastructure/db/schema'
import { eq, count, sum, ne, gte, and } from 'drizzle-orm'

export default async function AdminDashboard() {
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()

  const [productResult, pendingResult, revenueResult] = await Promise.all([
    db.select({ count: count() }).from(product).where(eq(product.isActive, true)),
    db.select({ count: count() }).from(order).where(eq(order.status, 'PENDING')),
    db.select({ total: sum(order.totalAmount) }).from(order).where(
      and(ne(order.status, 'CANCELLED'), gte(order.createdAt, todayStart))
    ),
  ])

  const cards = [
    { label: '上架商品', value: productResult[0].count, href: '/admin/products' },
    { label: '待取貨訂單', value: pendingResult[0].count, href: '/admin/orders' },
    { label: '今日營收', value: `$${revenueResult[0].total ?? 0}`, href: '/admin/reports' },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-6">總覽</h1>
      <div className="grid grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <p className="text-sm font-medium text-slate-600">{c.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
