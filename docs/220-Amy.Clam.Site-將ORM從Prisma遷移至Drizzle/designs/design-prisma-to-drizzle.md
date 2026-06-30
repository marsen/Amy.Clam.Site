# Design: Prisma 遷移至 Drizzle

**來源**：[story-20260630-01](../stories/story-20260630-01.md)

## 內容

### 現況

- ORM：Prisma（`@prisma/client` + `prisma`）
- Schema：`prisma/schema.prisma`（3 models：Product、Order、OrderItem；2 enums：OrderStatus、PickupLocation）
- DB：Neon PostgreSQL（資料已存在，不可破壞）
- 直接使用 Prisma client 的檔案：
  - `src/infrastructure/prisma/client.ts`
  - `src/app/admin/orders/actions.ts`
  - `src/app/api/orders/route.ts`
  - 以及多個 admin/API 頁面

### 遷移步驟

#### 1. 安裝 Drizzle

```bash
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit
```

#### 2. Schema 轉換

用 `drizzle-kit introspect` 從現有 Neon DB 反推 Drizzle schema，確保與現有資料結構完全一致。

輸出路徑：`src/infrastructure/db/schema.ts`

#### 3. 建立 Drizzle client

新增 `src/infrastructure/db/client.ts`（Neon serverless adapter）：

```ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

#### 4. 設定 drizzle.config.ts

```ts
import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({ path: '.env.local' })

export default defineConfig({
  schema: './src/infrastructure/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
})
```

#### 5. 替換所有 Prisma 呼叫

逐一將 `prisma.xxx.findMany()`、`prisma.xxx.create()` 等改為 Drizzle 的 `db.select()`、`db.insert()` 等。

#### 6. 移除 Prisma

```bash
pnpm remove @prisma/client prisma
rm -rf prisma/
```

更新 `package.json`：移除 `prisma.seed` 欄位。

#### 7. 清理 deploy.yml

移除 `pnpm exec prisma generate` 步驟。

### 資料層位置

| 項目 | 路徑 |
|------|------|
| Schema | `src/infrastructure/db/schema.ts` |
| Client | `src/infrastructure/db/client.ts` |
| Drizzle config | `drizzle.config.ts` |
| Migrations | `drizzle/migrations/` |

### 注意事項

- `introspect` 後需確認 enum 名稱與現有 DB 一致（Prisma 與 Drizzle 對 enum 的命名慣例不同）
- 現有資料不跑 migration，`introspect` 產生的 snapshot 作為起點
- `db:seed` script 需一併改寫（`prisma/seed.ts` → `scripts/db-seed.ts`）

## 待釐清
