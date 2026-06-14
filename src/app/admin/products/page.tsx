import { prisma } from '@/infrastructure/prisma/client'
import { revalidatePath } from 'next/cache'
import { ProductRow } from './ProductRow'

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'asc' } })

  async function updatePrice(id: string, price: number) {
    'use server'
    await prisma.product.update({ where: { id }, data: { price } })
    revalidatePath('/admin/products')
  }

  async function toggleActive(id: string, isActive: boolean) {
    'use server'
    await prisma.product.update({ where: { id }, data: { isActive } })
    revalidatePath('/admin/products')
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">商品管理</h1>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-800">商品名稱</th>
              <th className="text-left px-4 py-3 font-medium text-gray-800">價格（元）</th>
              <th className="text-left px-4 py-3 font-medium text-gray-800">狀態</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
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
          <p className="text-center text-gray-400 py-12">尚無商品</p>
        )}
      </div>
    </div>
  )
}
