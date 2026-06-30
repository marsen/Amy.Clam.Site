'use client'

import { useState } from 'react'
import type { InferSelectModel } from 'drizzle-orm'
import type { product } from '@/infrastructure/db/schema'

type Product = InferSelectModel<typeof product>

interface Props {
  product: Product
  onUpdatePrice: (id: string, price: number) => Promise<void>
  onToggleActive: (id: string, isActive: boolean) => Promise<void>
}

export function ProductRow({ product, onUpdatePrice, onToggleActive }: Props) {
  const [editing, setEditing] = useState(false)
  const [price, setPrice] = useState(String(product.price))
  const [saving, setSaving] = useState(false)

  async function savePrice() {
    const num = parseInt(price, 10)
    if (!num || num <= 0) return
    setSaving(true)
    await onUpdatePrice(product.id, num)
    setSaving(false)
    setEditing(false)
  }

  async function toggle() {
    await onToggleActive(product.id, !product.isActive)
  }

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3 font-medium text-slate-900">{product.name}</td>
      <td className="px-4 py-3 text-slate-800">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1 w-24 text-sm text-slate-900"
            />
            <button
              onClick={savePrice}
              disabled={saving}
              className="text-xs bg-[#1E3A5F] text-white px-3 py-1 rounded hover:bg-[#162D4A] disabled:opacity-50"
            >
              儲存
            </button>
            <button onClick={() => setEditing(false)} className="text-xs text-slate-500 hover:text-slate-700">
              取消
            </button>
          </div>
        ) : (
          <span className="cursor-pointer hover:text-[#1E3A5F] hover:underline" onClick={() => setEditing(true)}>
            ${product.price}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={toggle}
          className={`text-xs px-3 py-1 rounded-full font-semibold ${
            product.isActive
              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {product.isActive ? '上架中' : '已下架'}
        </button>
      </td>
    </tr>
  )
}
