'use client'

import { useState } from 'react'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = {
  PENDING: '待取貨',
  COMPLETED: '已取貨',
  CANCELLED: '已取消',
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-orange-50 text-[#E8622A] border border-orange-200',
  COMPLETED: 'bg-green-50 text-green-700 border border-green-200',
  CANCELLED: 'bg-gray-100 text-gray-400 border border-gray-200',
}

const LOCATION_LABEL: Record<string, string> = {
  SHINDIAN: '新店',
  NEIHU: '內湖',
}

interface OrderItem {
  productName: string
  quantity: number
  subtotal: number
}

interface Order {
  id: string
  pickupLocation: string
  pickupDate: string
  pickupTime: string
  status: string
  totalAmount: number
  createdAt: string
  items: OrderItem[]
}

export default function OrdersPage() {
  const [phone, setPhone] = useState('')
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/orders?phone=${phone}`)
    const data = await res.json()
    setOrders(res.ok ? data : [])
    setSearched(true)
    setLoading(false)
  }

  return (
    <div className="p-4 pb-8">
      <Link href="/" className="text-sm text-[#E8622A] mb-4 inline-block">← 回到商品</Link>
      <h1 className="text-xl font-bold text-[#1A1A1A] mb-4">查詢訂單</h1>

      <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border border-orange-50 p-4 mb-4">
        <label className="text-sm text-gray-500 mb-1.5 block">手機號碼</label>
        <div className="flex gap-2">
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="09xxxxxxxx"
            required
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8622A]"
          />
          <button type="submit" disabled={loading}
            className="bg-[#E8622A] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#d4561f] disabled:opacity-50">
            {loading ? '查詢中' : '查詢'}
          </button>
        </div>
      </form>

      {searched && orders?.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">找不到此電話的訂單記錄</p>
        </div>
      )}

      {orders && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-orange-50 p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400 font-mono mb-0.5"># {order.id.slice(0, 8)}</p>
                  <p className="font-semibold text-[#1A1A1A]">
                    {LOCATION_LABEL[order.pickupLocation]}
                  </p>
                  <p className="text-sm text-gray-500">{order.pickupDate} {order.pickupTime}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLOR[order.status]}`}>
                  {STATUS_LABEL[order.status]}
                </span>
              </div>
              <div className="border-t border-orange-50 pt-3 space-y-1.5">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.productName} × {item.quantity}</span>
                    <span className="text-gray-700">NT$ {item.subtotal}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-2 border-t border-orange-50 mt-1">
                  <span className="text-gray-700">合計</span>
                  <span className="text-[#E8622A] text-base">NT$ {order.totalAmount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
