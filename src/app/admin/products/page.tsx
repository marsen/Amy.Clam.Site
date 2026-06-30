import { db } from '@/infrastructure/db/client'
import { product } from '@/infrastructure/db/schema'
import { eq, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { ProductRow } from './ProductRow'

export default async function ProductsPage() {
  const products = await db.select().from(product).orderBy(asc(product.createdAt))

  async function updatePrice(id: string, price: number) {
    'use server'
    await db.update(product).set({ price }).where(eq(product.id, id))
    revalidatePath('/admin/products')
  }

  async function toggleActive(id: string, isActive: boolean) {
    'use server'
    await db.update(product).set({ isActive }).where(eq(product.id, id))
    revalidatePath('/admin/products')
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-6">商品管理</h1>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">商品名稱</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">價格（元）</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">狀態</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                onUpdatePrice={updatePrice}
                onToggleActive={toggleActive}
              />
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="text-center text-slate-500 py-12">尚無商品</p>
        )}
      </div>
    </div>
  )
}
