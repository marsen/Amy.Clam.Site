import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Amy 蛤蜊選物',
  description: '新鮮蛤蜊，新店/內湖自取',
}

export default function LiffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FFF8F4] font-sans">
      <header className="bg-[#E8622A] text-white px-4 py-3 flex items-center gap-2 sticky top-0 z-10 shadow-sm">
        <span className="text-xl">🐚</span>
        <span className="font-bold text-lg tracking-wide">Amy 蛤蜊選物</span>
      </header>
      <main className="max-w-lg mx-auto">{children}</main>
    </div>
  )
}
