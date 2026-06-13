'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SLOTS = {
  SHINDIAN: ['08:00', '09:00', '10:00', '11:00', '12:00'],
  NEIHU: ['15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'],
}

type Location = 'SHINDIAN' | 'NEIHU'

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const [location, setLocation] = useState<Location | null>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [products, setProducts] = useState<{ id: string; name: string; price: number }[]>([])
  const [loaded, setLoaded] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!loaded) {
    setLoaded(true)
    fetch('/api/products').then(r => r.json()).then(setProducts).catch(() => {})
  }

  function setQty(product: { id: string; name: string; price: number }, qty: number) {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id)
      if (qty === 0) return prev.filter(i => i.productId !== product.id)
      if (existing) return prev.map(i => i.productId === product.id ? { ...i, quantity: qty } : i)
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: qty }]
    })
  }

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!location || !date || !time) { setError('請填寫完整資訊'); return }
    if (cart.length === 0) { setError('請至少選擇一項商品'); return }
    if (!/^09\d{8}$/.test(phone)) { setError('請輸入有效的手機號碼（09xxxxxxxx）'); return }

    setSubmitting(true)
    setError('')
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: name,
        customerPhone: phone,
        pickupLocation: location,
        pickupDate: date,
        pickupTime: time,
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity })),
      }),
    })
    setSubmitting(false)
    if (!res.ok) { setError('下單失敗，請稍後再試'); return }
    const order = await res.json()
    router.push(`/checkout/success?id=${order.id}`)
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().slice(0, 10)

  return (
    <div className="pb-8">
      <div className="px-4 pt-4 pb-2">
        <Link href="/" className="text-sm text-[#E8622A]">← 回到商品</Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 px-4">

        {/* 選商品 */}
        <section className="bg-white rounded-2xl shadow-sm border border-orange-50 p-4">
          <h2 className="font-bold text-[#1A1A1A] mb-3">選擇商品</h2>
          {products.length === 0 && <p className="text-gray-400 text-sm">載入中...</p>}
          <div className="space-y-3.5">
            {products.map(p => {
              const qty = cart.find(i => i.productId === p.id)?.quantity ?? 0
              return (
                <div key={p.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">{p.name}</p>
                    <p className="text-sm text-[#E8622A] font-bold">NT$ {p.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setQty(p, Math.max(0, qty - 1))}
                      className="w-8 h-8 rounded-full border border-gray-200 text-lg leading-none flex items-center justify-center hover:bg-orange-50 text-gray-500">−</button>
                    <span className="w-5 text-center text-sm font-bold">{qty}</span>
                    <button type="button" onClick={() => setQty(p, qty + 1)}
                      className="w-8 h-8 rounded-full bg-[#E8622A] text-white text-lg leading-none flex items-center justify-center hover:bg-[#d4561f]">+</button>
                  </div>
                </div>
              )
            })}
          </div>
          {total > 0 && (
            <div className="mt-4 pt-3 border-t flex justify-between font-bold">
              <span className="text-gray-600">小計</span>
              <span className="text-[#E8622A] text-lg">NT$ {total}</span>
            </div>
          )}
        </section>

        {/* 取貨地點 */}
        <section className="bg-white rounded-2xl shadow-sm border border-orange-50 p-4">
          <h2 className="font-bold text-[#1A1A1A] mb-3">取貨地點</h2>
          <div className="grid grid-cols-2 gap-3">
            {(['SHINDIAN', 'NEIHU'] as Location[]).map(loc => (
              <button key={loc} type="button"
                onClick={() => { setLocation(loc); setTime('') }}
                className={`py-3 px-4 rounded-xl border-2 text-left transition-all ${
                  location === loc ? 'border-[#E8622A] bg-orange-50' : 'border-gray-100 hover:border-orange-200'
                }`}>
                <p className="font-bold text-sm text-[#1A1A1A]">{loc === 'SHINDIAN' ? '🏡 新店' : '🏙 內湖'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{loc === 'SHINDIAN' ? '早上 08:00–12:00' : '下午 15:30–18:30'}</p>
              </button>
            ))}
          </div>
        </section>

        {/* 取貨日期與時段 */}
        {location && (
          <section className="bg-white rounded-2xl shadow-sm border border-orange-50 p-4">
            <h2 className="font-bold text-[#1A1A1A] mb-3">取貨日期與時段</h2>
            <input type="date" value={date} min={minDate} onChange={e => setDate(e.target.value)} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#E8622A]" />
            <div className="grid grid-cols-4 gap-2">
              {SLOTS[location].map(slot => (
                <button key={slot} type="button" onClick={() => setTime(slot)}
                  className={`py-2 rounded-xl text-sm font-medium border transition-all ${
                    time === slot ? 'bg-[#E8622A] text-white border-[#E8622A]' : 'border-gray-200 text-gray-700 hover:border-orange-300'
                  }`}>
                  {slot}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 聯絡資料 */}
        <section className="bg-white rounded-2xl shadow-sm border border-orange-50 p-4 space-y-3">
          <h2 className="font-bold text-[#1A1A1A]">聯絡資料</h2>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">姓名</label>
            <input value={name} onChange={e => setName(e.target.value)} required placeholder="您的姓名"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8622A]" />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">手機號碼</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} required placeholder="09xxxxxxxx"
              type="tel" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8622A]" />
          </div>
        </section>

        {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-xl">{error}</p>}

        <button type="submit" disabled={submitting}
          className="w-full bg-[#E8622A] text-white py-4 rounded-2xl font-bold text-base shadow-md hover:bg-[#d4561f] disabled:opacity-50 active:scale-95 transition-all">
          {submitting ? '處理中...' : `確認下單 NT$ ${total}`}
        </button>
      </form>
    </div>
  )
}
