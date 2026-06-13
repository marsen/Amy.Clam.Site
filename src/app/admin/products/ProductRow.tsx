'use client'

import { useState } from 'react'
import type { Product } from '@prisma/client'

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
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 font-medium">{product.name}</td>
      <td className="px-4 py-3">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="border rounded px-2 py-1 w-24 text-sm"
            />
            <button
              onClick={savePrice}
              disabled={saving}
              className="text-xs bg-neutral-900 text-white px-3 py-1 rounded hover:bg-neutral-700 disabled:opacity-50"
            >
              儲存
            </button>
            <button onClick={() => setEditing(false)} className="text-xs text-gray-400 hover:text-gray-600">
              取消
            </button>
          </div>
        ) : (
          <span
            className="cursor-pointer hover:text-blue-600"
            onClick={() => setEditing(true)}
          >
            ${product.price}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={toggle}
          className={`text-xs px-3 py-1 rounded-full font-medium ${
            product.isActive
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {product.isActive ? '上架中' : '已下架'}
        </button>
      </td>
    </tr>
  )
}
