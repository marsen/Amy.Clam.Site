# Design: 後台登入認證

**來源**：[story-20260613-04](../stories/story-20260613-04.md) 管理者登入後台

## 策略

單一管理員帳號，帳密存 Vercel 環境變數，**不需要 DB user table**。
使用 NextAuth v5（Auth.js）Credentials Provider + JWT session。

## 實作

### 安裝

```bash
npm install next-auth@beta
```

### 設定（`src/auth.ts`）

```typescript
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { env } from '@/infrastructure/config/env'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        if (
          credentials.email === env.ADMIN_EMAIL &&
          credentials.password === env.ADMIN_PASSWORD
        ) {
          return { id: '1', email: env.ADMIN_EMAIL }
        }
        return null
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
})
```

### 路由保護（Middleware）

```typescript
// src/middleware.ts
import { auth } from '@/auth'

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = req.nextUrl.pathname === '/admin/login'
  if (isAdminRoute && !isLoginPage && !req.auth) {
    return Response.redirect(new URL('/admin/login', req.url))
  }
})

export const config = { matcher: ['/admin/:path*'] }
```

### 登入頁（`/admin/login`）

Server Action 呼叫 `signIn('credentials', ...)`，
失敗時回傳錯誤訊息顯示在頁面。

## 安全考量

- `ADMIN_PASSWORD` MVP 階段可存明文，上線前改為 bcrypt hash
- `NEXTAUTH_SECRET` 必須設定且隨機生成（`openssl rand -base64 32`）
- HTTPS（Vercel 預設啟用）

## 待釐清
