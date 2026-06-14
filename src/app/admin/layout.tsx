import Link from 'next/link'
import { signOut } from '@/auth'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-[#1E3A5F] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg text-white">Amy 後台</span>
          <Link href="/admin" className="text-sm text-blue-200 hover:text-white transition-colors">首頁</Link>
          <Link href="/admin/products" className="text-sm text-blue-200 hover:text-white transition-colors">商品管理</Link>
          <Link href="/admin/orders" className="text-sm text-blue-200 hover:text-white transition-colors">訂單列表</Link>
          <Link href="/admin/reports" className="text-sm text-blue-200 hover:text-white transition-colors">銷售報表</Link>
        </div>
        <form action={async () => { 'use server'; await signOut({ redirectTo: '/admin/login' }) }}>
          <button type="submit" className="text-sm text-blue-200 hover:text-white transition-colors">登出</button>
        </form>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
