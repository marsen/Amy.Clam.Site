# Design: 整體架構

**來源**：所有 stories

## 技術選型

| 項目 | 選擇 | 理由 |
|------|------|------|
| 框架 | Next.js 15 App Router | 前後台 + API 同一 repo，LIFF 頁面、admin 頁面、API routes 全包 |
| 語言 | TypeScript | 型別安全，與 Prisma 搭配最佳 |
| DB | PostgreSQL on Neon | 免費 tier，無需自管，Prisma 原生支援 |
| ORM | Prisma | schema-first，型別自動生成，migration 管理 |
| 樣式 | Tailwind CSS + shadcn/ui | 快速搭建 UI，shadcn 提供 Admin 所需元件 |
| Auth | NextAuth v5 (Credentials) | 單一 admin 帳號，從 env vars 讀取，無需 DB user table |
| 圖表 | Recharts | React-native，輕量，支援 LineChart |
| 天氣 | 中央氣象署開放資料 API | 免費，台灣在地，有觀測站資料 |
| 部署 | Vercel | Next.js 原生支援，免費 tier 足夠 MVP |

## 架構分層（Clean Architecture）

```
src/
├── domain/                  # 純業務邏輯，零外部依賴
│   ├── product/
│   │   ├── Product.ts       # Entity
│   │   └── ProductRepository.ts  # Port (interface)
│   ├── order/
│   │   ├── Order.ts
│   │   ├── OrderItem.ts
│   │   └── OrderRepository.ts
│   └── weather/
│       ├── WeatherSnapshot.ts
│       └── WeatherService.ts  # Port
│
├── application/             # Use Cases，協調 Domain + Ports
│   ├── product/
│   │   ├── GetActiveProducts.ts
│   │   ├── UpdateProductPrice.ts
│   │   └── ToggleProductStatus.ts
│   ├── order/
│   │   ├── CreateOrder.ts   # 建立訂單 + 記錄天氣
│   │   ├── GetOrdersByPhone.ts
│   │   └── UpdateOrderStatus.ts
│   └── report/
│       └── GetSalesReport.ts
│
├── infrastructure/          # Adapters（實作 Ports）
│   ├── prisma/
│   │   ├── PrismaProductRepository.ts
│   │   └── PrismaOrderRepository.ts
│   ├── weather/
│   │   └── CwaWeatherService.ts  # 中央氣象署
│   └── config/
│       └── env.ts           # 統一讀取 process.env，Zod 驗證
│
└── app/                     # Next.js Presentation Layer
    ├── (liff)/              # 客戶側 LIFF 頁面
    │   ├── page.tsx         # 商品列表 + 天氣
    │   ├── checkout/
    │   └── orders/
    ├── admin/               # 管理後台
    │   ├── login/
    │   ├── products/
    │   ├── orders/
    │   └── reports/
    └── api/                 # API Routes
        ├── products/
        ├── orders/
        ├── weather/
        └── admin/
```

## 依賴方向

```
Presentation (app/)
    ↓
Application (use-cases)
    ↓
Domain (entities + ports)
    ↑
Infrastructure (implements ports)
```

## 環境變數（env.ts 統一管理）

```
DATABASE_URL          # Neon PostgreSQL
NEXTAUTH_SECRET       # NextAuth JWT 簽名
ADMIN_EMAIL           # 管理員帳號
ADMIN_PASSWORD        # 管理員密碼（hashed or plain for MVP）
CWA_API_KEY                  # 中央氣象署 API key
CWA_STATION_ID_SHINDIAN      # 新店觀測站 ID（新北市新店區）
CWA_STATION_ID_NEIHU         # 內湖觀測站 ID（台北市內湖區）
NEXT_PUBLIC_LIFF_ID          # LINE LIFF ID（client 側需要）
```

## 待釐清
