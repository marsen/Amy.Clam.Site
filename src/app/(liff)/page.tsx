import Link from 'next/link'
import { db } from '@/infrastructure/db/client'
import { product } from '@/infrastructure/db/schema'
import { eq, asc } from 'drizzle-orm'

async function getWeather() {
  try {
    const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    const res = await fetch(`${base}/api/weather`, { next: { revalidate: 600 } })
    return res.ok ? res.json() : null
  } catch { return null }
}

function WeatherCard({ label, location, data }: {
  label: string
  location: string
  data: { temp: number; description: string; humidity: number } | null
}) {
  return (
    <div className="flex-1 bg-white rounded-2xl p-4 text-center shadow-sm border border-orange-100">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {data ? (
        <>
          <p className="text-3xl font-bold text-[#E8622A]">{data.temp.toFixed(1)}°</p>
          <p className="text-sm text-gray-700 mt-0.5">{data.description}</p>
          <p className="text-xs text-gray-400 mt-0.5">濕度 {data.humidity}%</p>
        </>
      ) : (
        <p className="text-xs text-gray-400 py-3">天氣資訊<br />暫時無法取得</p>
      )}
      <p className="text-xs text-[#E8622A] font-medium mt-2">{location}</p>
    </div>
  )
}

export default async function StorePage() {
  const [products, weather] = await Promise.all([
    db.select().from(product).where(eq(product.isActive, true)).orderBy(asc(product.createdAt)),
    getWeather(),
  ])

  return (
    <div className="pb-28">
      {/* 天氣 */}
      <div className="px-4 pt-5 pb-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">📍 今日天氣</p>
        <div className="flex gap-3">
          <WeatherCard label="早上・新店" location="08:00–12:00" data={weather?.shindian} />
          <WeatherCard label="下午・內湖" location="15:30–18:30" data={weather?.neihu} />
        </div>
      </div>

      {/* 商品列表 */}
      <div className="px-4 pt-5">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">🐚 今日商品</p>
        <div className="space-y-2.5">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-orange-50 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#1A1A1A]">{p.name}</p>
                <p className="text-[#E8622A] font-bold text-lg mt-0.5">NT$ {p.price}</p>
              </div>
              <span className="text-xs bg-orange-50 text-[#E8622A] border border-orange-200 px-2.5 py-1 rounded-full font-medium">有貨</span>
            </div>
          ))}
        </div>
        {products.length === 0 && (
          <p className="text-center text-gray-400 py-12">今日暫無商品</p>
        )}
      </div>

      {/* 底部 CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto px-4 pb-6 pt-3 bg-gradient-to-t from-[#FFF8F4] via-[#FFF8F4] to-transparent">
        <div className="flex gap-3">
          <Link
            href="/checkout"
            className="flex-1 bg-[#E8622A] text-white text-center py-3.5 rounded-2xl font-bold shadow-md hover:bg-[#d4561f] active:scale-95 transition-all"
          >
            立即下單
          </Link>
          <Link
            href="/orders"
            className="flex-1 bg-white text-[#E8622A] text-center py-3.5 rounded-2xl font-bold shadow-sm border-2 border-[#E8622A] hover:bg-orange-50 active:scale-95 transition-all"
          >
            查詢訂單
          </Link>
        </div>
      </div>
    </div>
  )
}
