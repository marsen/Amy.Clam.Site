import { prisma } from '@/infrastructure/prisma/client'
import { RevenueChart } from './RevenueChart'

function getWeekRange() {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  monday.setHours(0, 0, 0, 0)
  return { from: monday.toISOString().slice(0, 10), to: now.toISOString().slice(0, 10) }
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const { from: qFrom, to: qTo } = await searchParams
  const defaultRange = getWeekRange()
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

  // 每日營收
  const dailyMap = new Map<string, number>()
  for (const o of orders) {
    const d = o.createdAt.toISOString().slice(0, 10)
    dailyMap.set(d, (dailyMap.get(d) ?? 0) + o.totalAmount)
  }
  const dailyRevenue = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }))

  // 各商品彙總
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
      <h1 className="text-xl font-bold mb-4">銷售報表</h1>

      {/* 日期篩選 */}
      <form className="flex items-center gap-2 mb-6">
        <input type="date" name="from" defaultValue={from} className="border rounded px-3 py-1.5 text-sm" />
        <span className="text-gray-400">～</span>
        <input type="date" name="to" defaultValue={to} className="border rounded px-3 py-1.5 text-sm" />
        <button type="submit" className="bg-neutral-900 text-white px-4 py-1.5 rounded text-sm hover:bg-neutral-700">
          查詢
        </button>
      </form>

      {/* 總營收 */}
      <div className="bg-white rounded-xl border shadow-sm p-6 mb-6 inline-block">
        <p className="text-sm text-gray-700">總營收</p>
        <p className="text-4xl font-bold mt-1">${totalRevenue.toLocaleString()}</p>
      </div>

      {/* 折線圖 */}
      {dailyRevenue.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
          <h2 className="text-sm font-medium text-gray-800 mb-4">每日營收</h2>
          <RevenueChart data={dailyRevenue} />
        </div>
      )}

      {/* 商品彙總 */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <h2 className="text-sm font-medium text-gray-800 px-4 py-3 border-b bg-gray-50">各商品銷售</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-gray-800">商品名稱</th>
              <th className="text-right px-4 py-2 font-medium text-gray-800">數量</th>
              <th className="text-right px-4 py-2 font-medium text-gray-800">小計</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {productSummary.map((p) => (
              <tr key={p.name} className="hover:bg-gray-50">
                <td className="px-4 py-2">{p.name}</td>
                <td className="px-4 py-2 text-right">{p.qty}</td>
                <td className="px-4 py-2 text-right">${p.subtotal.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {productSummary.length === 0 && (
          <p className="text-center text-gray-400 py-8">此區間無訂單</p>
        )}
      </div>
    </div>
  )
}
