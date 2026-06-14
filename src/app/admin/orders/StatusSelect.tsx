'use client'

import { OrderStatus } from '@prisma/client'
import { updateOrderStatus } from './actions'

const statusLabel: Record<OrderStatus, string> = {
  PENDING: '待取貨',
  COMPLETED: '已取貨',
  CANCELLED: '已取消',
}

export function StatusSelect({ id, status }: { id: string; status: OrderStatus }) {
  return (
    <select
      defaultValue={status}
      onChange={(e) => updateOrderStatus(id, e.target.value as OrderStatus)}
      className="text-xs border border-slate-300 rounded px-2 py-1 text-slate-800 bg-white"
    >
      {(Object.keys(statusLabel) as OrderStatus[]).map((s) => (
        <option key={s} value={s}>{statusLabel[s]}</option>
      ))}
    </select>
  )
}
