import Link from 'next/link'
import { db } from '@/infrastructure/db/client'
import { order } from '@/infrastructure/db/schema'
import { eq } from 'drizzle-orm'
import { LiffOrderSuccess } from '@/components/LiffOrderSuccess'

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams
  const found = id ? await db.query.order.findFirst({ where: eq(order.id, id) }) : null

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      {found && (
        <LiffOrderSuccess
          orderId={found.id}
          location={found.pickupLocation}
          date={found.pickupDate}
          time={found.pickupTime}
          total={found.totalAmount}
        />
      )}
      <div className="bg-white rounded-3xl shadow-sm border border-orange-50 p-8 w-full max-w-sm">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h1 className="text-xl font-bold text-[#1A1A1A] mb-2">下單成功！</h1>
        {found && (
          <div className="text-sm text-gray-500 mb-4 space-y-1">
            <p className="font-mono text-xs bg-gray-100 px-3 py-1 rounded-lg inline-block"># {found.id.slice(0, 8)}</p>
            <p className="mt-2">{found.pickupLocation === 'SHINDIAN' ? '新店' : '內湖'} · {found.pickupDate} {found.pickupTime}</p>
            <p className="font-bold text-[#E8622A]">NT$ {found.totalAmount}</p>
          </div>
        )}
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          我們已收到您的訂單，<br />請依約定時間前往取貨。
        </p>
        <div className="space-y-2.5">
          <Link href="/orders"
            className="block w-full bg-[#E8622A] text-white py-3 rounded-2xl text-sm font-bold hover:bg-[#d4561f]">
            查看我的訂單
          </Link>
          <Link href="/"
            className="block w-full text-[#E8622A] py-3 rounded-2xl text-sm font-medium hover:bg-orange-50 border border-orange-100">
            回到商品頁
          </Link>
        </div>
      </div>
    </div>
  )
}
