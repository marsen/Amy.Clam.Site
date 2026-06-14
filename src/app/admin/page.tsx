import Link from 'next/link'
import { prisma } from '@/infrastructure/prisma/client'

export default async function AdminDashboard() {
  const [productCount, pendingCount, todayRevenue] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: { not: 'CANCELLED' },
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ])

  const cards = [
    { label: '上架商品', value: productCount, href: '/admin/products' },
    { label: '待取貨訂單', value: pendingCount, href: '/admin/orders' },
    { label: '今日營收', value: `$${todayRevenue._sum.totalAmount ?? 0}`, href: '/admin/reports' },
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
