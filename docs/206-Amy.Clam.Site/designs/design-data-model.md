# Design: 資料模型

**來源**：
- [story-20260613-02](../stories/story-20260613-02.md) 客戶下單
- [story-20260613-03](../stories/story-20260613-03.md) 查歷史訂單
- [story-20260613-05](../stories/story-20260613-05.md) 管理商品
- [story-20260613-06](../stories/story-20260613-06.md) 銷售報表
- [story-20260613-07](../stories/story-20260613-07.md) 訂單明細

## Prisma Schema

```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  price       Int              // 台幣整數
  imageUrl    String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  orderItems  OrderItem[]
}

model Order {
  id               String         @id @default(cuid())
  customerName     String
  customerPhone    String
  pickupLocation   PickupLocation
  pickupDate       String         // "2026-06-15"
  pickupTime       String         // "08:00" | "15:30" 等時段
  status           OrderStatus    @default(PENDING)
  totalAmount      Int            // 快照，避免日後改價影響報表
  weatherSnapshot  Json?          // { location, temp, description, humidity }
  createdAt        DateTime       @default(now())

  items  OrderItem[]
}

model OrderItem {
  id           String  @id @default(cuid())
  orderId      String
  productId    String
  productName  String  // 快照，避免商品改名影響歷史紀錄
  productPrice Int     // 快照
  quantity     Int
  subtotal     Int

  order    Order   @relation(fields: [orderId], references: [id])
  product  Product @relation(fields: [productId], references: [id])
}

enum OrderStatus {
  PENDING    // 待取貨
  COMPLETED  // 已取貨
  CANCELLED  // 已取消
}

enum PickupLocation {
  SHINDIAN  // 新店（08:00~12:00）
  NEIHU     // 內湖（15:30~18:30）
}
```

## 設計決策

**價格與商品名稱快照**：`OrderItem` 儲存下單當時的 `productName` 與 `productPrice`，
避免日後管理者調整價格或商品名稱時影響歷史訂單。

**天氣快照為 JSON**：`weatherSnapshot` 直接存在 `Order` 上，不另開 table，
結構簡單且查詢時不需 JOIN。格式：
```json
{ "temp": 28.5, "description": "多雲", "humidity": 78 }
```

**totalAmount 快照**：訂單總金額快照在 `Order.totalAmount`，
銷售報表直接 `SUM(totalAmount)` 不需再算 `OrderItem`。

**取消的訂單排除出報表**：
```sql
WHERE status != 'CANCELLED'
```

## 索引

```prisma
@@index([customerPhone])   // 客戶查歷史訂單
@@index([createdAt])       // 報表依日期查詢
@@index([status])          // 訂單列表篩選
```

## 時段對應表

| PickupLocation | 可選時段 |
|---------------|---------|
| SHINDIAN（新店）| 08:00, 09:00, 10:00, 11:00, 12:00 |
| NEIHU（內湖）  | 15:30, 16:00, 16:30, 17:00, 17:30, 18:00, 18:30 |

前端依客戶選擇的地點動態渲染時段選項，後端建立訂單時驗證 `pickupTime` 是否在對應地點的合法時段內。

## 待釐清
