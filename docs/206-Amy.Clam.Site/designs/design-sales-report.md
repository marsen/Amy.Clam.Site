# Design: 銷售報表

**來源**：[story-20260613-06](../stories/story-20260613-06.md) 管理者查看銷售報表

## UI 佈局

```
[ 起始日期 ] ～ [ 結束日期 ]  [查詢]

總營收：$12,500

─── 每日營收折線圖 ────────────────
  (Recharts LineChart)
  X 軸：日期  Y 軸：金額（元）
────────────────────────────────────

─── 各商品銷售明細 ──────────────────
  商品名稱    | 數量 | 小計
  ─────────────────────────
  蛤蜊 M 號   |  42  | $4,200
  蛤蜊 L 號   |  28  | $5,600
  ...
────────────────────────────────────
```

## 資料查詢

API route：`GET /api/admin/reports?from=2026-06-01&to=2026-06-13`

```typescript
// application/report/GetSalesReport.ts
// 查詢條件：status != CANCELLED，createdAt 在區間內

// 回傳結構
interface SalesReport {
  totalRevenue: number
  dailyRevenue: { date: string; amount: number }[]   // 折線圖資料
  productSummary: { name: string; qty: number; subtotal: number }[]
}
```

```sql
-- 每日營收
SELECT DATE(createdAt) as date, SUM(totalAmount) as amount
FROM Order
WHERE status != 'CANCELLED'
  AND createdAt BETWEEN :from AND :to
GROUP BY DATE(createdAt)
ORDER BY date

-- 商品彙總（JOIN OrderItem）
SELECT oi.productName, SUM(oi.quantity) as qty, SUM(oi.subtotal) as subtotal
FROM OrderItem oi
JOIN Order o ON oi.orderId = o.id
WHERE o.status != 'CANCELLED'
  AND o.createdAt BETWEEN :from AND :to
GROUP BY oi.productName
```

## 圖表實作（Recharts）

```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

<LineChart data={dailyRevenue}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip formatter={(v) => `$${v}`} />
  <Line type="monotone" dataKey="amount" stroke="#2563eb" />
</LineChart>
```

## 預設區間

進入報表頁時預設帶入**本週**（週一 ~ 今天）。

## 待釐清
