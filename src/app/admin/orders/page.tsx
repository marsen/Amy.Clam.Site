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
  PENDING: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
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
      <h1 className="text-xl font-bold mb-4">訂單列表</h1>
      <div className="flex gap-2 mb-4 text-sm">
        {([undefined, 'PENDING', 'COMPLETED', 'CANCELLED'] as const).map((s) => (
          <Link
            key={s ?? 'all'}
            href={s ? `/admin/orders?status=${s}` : '/admin/orders'}
            className={`px-3 py-1 rounded-full border ${
              (status ?? '') === (s ?? '')
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'hover:bg-gray-100'
            }`}
          >
            {s ? statusLabel[s] : '全部'}
          </Link>
        ))}
      </div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-800">訂單編號</th>
              <th className="text-left px-4 py-3 font-medium text-gray-800">姓名</th>
              <th className="text-left px-4 py-3 font-medium text-gray-800">電話</th>
              <th className="text-left px-4 py-3 font-medium text-gray-800">取貨地點</th>
              <th className="text-left px-4 py-3 font-medium text-gray-800">取貨時間</th>
              <th className="text-left px-4 py-3 font-medium text-gray-800">金額</th>
              <th className="text-left px-4 py-3 font-medium text-gray-800">狀態</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{o.id.slice(0, 8)}</td>
                <td className="px-4 py-3 font-medium">{o.customerName}</td>
                <td className="px-4 py-3">{o.customerPhone}</td>
                <td className="px-4 py-3">{locationLabel[o.pickupLocation]}</td>
                <td className="px-4 py-3">
                  {o.pickupDate} {o.pickupTime}
                </td>
                <td className="px-4 py-3">${o.totalAmount}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[o.status]}`}>
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
          <p className="text-center text-gray-400 py-12">尚無訂單</p>
        )}
      </div>
    </div>
  )
}
