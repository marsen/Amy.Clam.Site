import { prisma } from '@/infrastructure/prisma/client'
import Link from 'next/link'
import { OrderStatus, PickupLocation } from '@prisma/client'
import { StatusSelect } from './StatusSelect'

const statusLabel: Record<OrderStatus, string> = {
  PENDING: '待取貨',
  COMPLETED: '已取貨',
  CANCELLED: '已取消',
}

const statusColor: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-slate-100 text-slate-600',
}

const locationLabel: Record<PickupLocation, string> = {
  SHINDIAN: '新店',
  NEIHU: '內湖',
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const where =
    status && Object.keys(OrderStatus).includes(status)
      ? { status: status as OrderStatus }
      : undefined

  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-4">訂單列表</h1>
      <div className="flex gap-2 mb-4 text-sm">
        {([undefined, 'PENDING', 'COMPLETED', 'CANCELLED'] as const).map((s) => (
          <Link
            key={s ?? 'all'}
            href={s ? `/admin/orders?status=${s}` : '/admin/orders'}
            className={`px-3 py-1 rounded-full border font-medium transition-colors ${
              (status ?? '') === (s ?? '')
                ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                : 'text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            {s ? statusLabel[s] : '全部'}
          </Link>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">訂單編號</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">姓名</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">電話</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">取貨地點</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">取貨時間</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">金額</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">狀態</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{o.id.slice(0, 8)}</td>
                <td className="px-4 py-3 font-semibold text-slate-900">{o.customerName}</td>
                <td className="px-4 py-3 text-slate-700">{o.customerPhone}</td>
                <td className="px-4 py-3 text-slate-700">{locationLabel[o.pickupLocation]}</td>
                <td className="px-4 py-3 text-slate-700">
                  {o.pickupDate} {o.pickupTime}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">${o.totalAmount}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColor[o.status]}`}>
                    {statusLabel[o.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusSelect id={o.id} status={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="text-center text-slate-500 py-12">尚無訂單</p>
        )}
      </div>
    </div>
  )
}
