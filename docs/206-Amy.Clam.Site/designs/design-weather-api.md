# Design: 天氣 API 整合

**來源**：
- [story-20260613-01](../stories/story-20260613-01.md) 前台顯示今日天氣
- [story-20260613-02](../stories/story-20260613-02.md) 下單時記錄當時天氣

## 資料來源

**中央氣象署開放資料平臺**（CWA Open Data）
- 免費，註冊後取得 API key
- 端點：`https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0001-001`
- 資料：即時地面觀測（各縣市觀測站），含氣溫、天氣狀況、濕度

## 兩個自取地點

| 地點 | 縣市 | 觀測站 | 環境變數 |
|------|------|--------|---------|
| 新店 | 新北市 | 新店（C0A9B0） | `CWA_STATION_ID_SHINDIAN` |
| 內湖 | 台北市 | 內湖（C0AI60） | `CWA_STATION_ID_NEIHU` |

> 觀測站 ID 請在中央氣象署開放資料平台確認後填入 `.env`

## 架構分層

```
Domain Port（WeatherService）
  ↑ 實作
Infrastructure Adapter（CwaWeatherService）
  ↓ 呼叫
CWA API
```

```typescript
// domain/weather/WeatherService.ts
export interface WeatherSnapshot {
  location: 'SHINDIAN' | 'NEIHU'
  temp: number        // 攝氏
  description: string // "多雲", "晴", "雨"
  humidity: number    // %
}

export interface WeatherService {
  getWeather(location: 'SHINDIAN' | 'NEIHU'): Promise<WeatherSnapshot>
}
```

```typescript
// infrastructure/weather/CwaWeatherService.ts
export class CwaWeatherService implements WeatherService {
  async getWeather(location: 'SHINDIAN' | 'NEIHU'): Promise<WeatherSnapshot> {
    const stationId = location === 'SHINDIAN'
      ? env.CWA_STATION_ID_SHINDIAN
      : env.CWA_STATION_ID_NEIHU
    const res = await fetch(
      `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0001-001` +
      `?Authorization=${env.CWA_API_KEY}&StationId=${stationId}`
    )
    // 解析回傳資料，取 TEMP / Weather / HUMD
  }
}
```

## 兩個使用情境

### 1. 前台顯示今日天氣

同時顯示兩個地點天氣，讓客戶對照自己要選哪個時段。
API route（cache 10 分鐘）：

```
GET /api/weather
→ {
    shindian: { temp: 27.0, description: "多雲", humidity: 75 },
    neihu:    { temp: 28.5, description: "晴",   humidity: 70 }
  }
```

### 2. 下單時記錄天氣快照

`CreateOrder` use case 依 `pickupLocation` 呼叫對應地點的天氣，
快照結構加上 `location` 欄位供日後分析：

```typescript
// application/order/CreateOrder.ts
async execute(input: CreateOrderInput) {
  const weather = await this.weatherService
    .getWeather(input.pickupLocation)
    .catch(() => null)
  // 建立 Order，帶入 weatherSnapshot: weather
  // e.g. { location: "SHINDIAN", temp: 27, description: "多雲", humidity: 75 }
}
```

若 CWA API 失敗，`weatherSnapshot` 設為 `null`，不阻斷下單流程。

## 錯誤處理策略

| 情境 | 前台 | 下單 |
|------|------|------|
| CWA API 逾時/失敗 | 該地點顯示「天氣資訊暫時無法取得」 | weatherSnapshot = null，訂單正常建立 |

## 待釐清
