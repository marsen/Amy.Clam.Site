# Design: LINE LIFF 整合

**來源**：
- [story-20260613-01](../stories/story-20260613-01.md) 瀏覽商品列表
- [story-20260613-02](../stories/story-20260613-02.md) 客戶下單
- [story-20260613-03](../stories/story-20260613-03.md) 查歷史訂單

## LIFF 是什麼

LIFF（LINE Front-end Framework）讓 LINE OA 可以開啟內嵌網頁。
客戶在 LINE 聊天室點連結 → 直接在 LINE 內開啟我們的網頁，無需跳出到瀏覽器。

## 設定流程

1. Amy 在 LINE Developers Console 建立 Provider + Channel（LINE Login）
2. 在 Channel 下新增 LIFF App，設定 Endpoint URL（Vercel 部署的網址）
3. 取得 `LIFF_ID`，設定為 `NEXT_PUBLIC_LIFF_ID` 環境變數

## 實作方式

### 安裝 LIFF SDK

```bash
npm install @line/liff
```

### LIFF 初始化（Client Component）

```typescript
// src/app/(liff)/LiffProvider.tsx
'use client'
import liff from '@line/liff'
import { useEffect } from 'react'

export function LiffProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })
  }, [])
  return <>{children}</>
}
```

### 路由規劃（App Router）

```
app/
├── (liff)/
│   ├── layout.tsx        # 包 LiffProvider
│   ├── page.tsx          # 商品列表 + 今日天氣
│   ├── checkout/
│   │   └── page.tsx      # 下單表單
│   └── orders/
│       └── page.tsx      # 用電話查歷史訂單
```

### 本機開發

LIFF 需要 HTTPS，本機開發時可用 `ngrok` 建立 tunnel：
```bash
ngrok http 3000
```
將 ngrok 網址設為 LIFF Endpoint URL 即可在 LINE 測試。

## 不需要 LINE Login

本案不需要取得使用者 LINE UID，電話號碼由客戶自填，
因此 LIFF scope 設 `chat_message.write` 即可，不需要 `profile`。

## 下單成功通知（liff.sendMessages）

下單成功後用 `liff.sendMessages()` 在客戶原本的聊天室送出確認訊息。
訊息由客戶端發出，顯示在客戶與 Amy OA 的對話中，無需額外 Messaging API 權限。

```typescript
// src/app/(liff)/checkout/page.tsx（下單成功後）
import liff from '@line/liff'

async function sendOrderConfirmation(order: { id: string; total: number; pickupLocation: string; pickupDate: string; pickupTime: string }) {
  if (!liff.isInClient()) return  // 外部瀏覽器開啟時略過

  const locationLabel = order.pickupLocation === 'SHINDIAN' ? '新店' : '內湖'

  await liff.sendMessages([
    {
      type: 'text',
      text: `✅ 訂單確認 #${order.id}\n` +
            `取貨地點：${locationLabel}\n` +
            `取貨時間：${order.pickupDate} ${order.pickupTime}\n` +
            `總金額：$${order.total}`,
    },
  ])
}
```

**限制**：
- `liff.sendMessages()` 只在 LINE 內開啟時有效（`liff.isInClient() === true`）
- 外部瀏覽器測試時會略過，不影響下單流程

## 待釐清
- [ ] Amy 是否已有 LINE OA？若無需協助申請
- [ ] LIFF 尺寸：Full（全螢幕）或 Tall（3/4 螢幕）？建議 Full
