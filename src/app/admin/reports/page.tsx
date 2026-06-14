import { prisma } from '@/infrastructure/prisma/client'
import { RevenueChart } from './RevenueChart'

function getDefaultRange() {
  const now = new Date()
  const from = new Date(now)
  from.setDate(now.getDate() - 29)
  return { from: from.toISOString().slice(0, 10), to: now.toISOString().slice(0, 10) }
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const { from: qFrom, to: qTo } = await searchParams
  const defaultRange = getDefaultRange()
  const from = qFrom ?? defaultRange.from
  const to = qTo ?? defaultRange.to

  const fromDate = new Date(`${from}T00:00:00`)
  const toDate = new Date(`${to}T23:59:59`)

  const orders = await prisma.order.findMany({
    where: {
      status: { not: 'CANCELLED' },
      createdAt: { gte: fromDate, lte: toDate },
    },
    include: { items: true },
  })

  const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0)

  const dailyMap = new Map<string, number>()
  for (const o of orders) {
    const d = o.createdAt.toISOString().slice(0, 10)
    dailyMap.set(d, (dailyMap.get(d) ?? 0) + o.totalAmount)
  }
  const dailyRevenue = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }))

  const productMap = new Map<string, { qty: number; subtotal: number }>()
  for (const o of orders) {
    for (const item of o.items) {
      const existing = productMap.get(item.productName) ?? { qty: 0, subtotal: 0 }
      productMap.set(item.productName, {
        qty: existing.qty + item.quantity,
        subtotal: existing.subtotal + item.subtotal,
      })
    }
  }
  const productSummary = Array.from(productMap.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.subtotal - a.subtotal)

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-4">銷售報表</h1>

      <form className="flex items-center gap-2 mb-6">
        <input
          type="date"
          name="from"
          defaultValue={from}
          className="border border-slate-300 rounded px-3 py-1.5 text-sm text-slate-900"
        />
        <span className="text-slate-500">～</span>
        <input
          type="date"
          name="to"
          defaultValue={to}
          className="border border-slate-300 rounded px-3 py-1.5 text-sm text-slate-900"
        />
        <button
          type="submit"
          className="bg-[#1E3A5F] text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-[#162D4A]"
        >
          查詢
        </button>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6 inline-block">
        <p className="text-sm font-medium text-slate-600">總營收</p>
        <p className="text-4xl font-bold text-slate-900 mt-1">${totalRevenue.toLocaleString()}</p>
      </div>

      {dailyRevenue.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">每日營收</h2>
          <RevenueChart data={dailyRevenue} />
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <h2 className="text-sm font-semibold text-slate-700 px-4 py-3 border-b border-slate-200 bg-slate-50">各商品銷售</h2>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-slate-700">商品名稱</th>
              <th className="text-right px-4 py-2 font-semibold text-slate-700">數量</th>
              <th className="text-right px-4 py-2 font-semibold text-slate-700">小計</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {productSummary.map((p) => (
              <tr key={p.name} className="hover:bg-slate-50">
                <td className="px-4 py-2 text-slate-800">{p.name}</td>
                <td className="px-4 py-2 text-right text-slate-800">{p.qty}</td>
                <td className="px-4 py-2 text-right font-medium text-slate-900">${p.subtotal.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {productSummary.length === 0 && (
          <p className="text-center text-slate-500 py-8">此區間無訂單</p>
        )}
      </div>
    </div>
  )
}
