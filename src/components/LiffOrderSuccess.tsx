'use client'

import { useEffect } from 'react'

interface Props {
  orderId: string
  location: string
  date: string
  time: string
  total: number
}

const LOCATION_LABEL: Record<string, string> = { SHINDIAN: '新店', NEIHU: '內湖' }

export function LiffOrderSuccess({ orderId, location, date, time, total }: Props) {
  useEffect(() => {
    import('@line/liff').then(async ({ default: liff }) => {
      if (!liff.isInClient()) return
      await liff.sendMessages([
        {
          type: 'text',
          text:
            `✅ 訂單確認 #${orderId.slice(0, 8)}\n` +
            `取貨地點：${LOCATION_LABEL[location] ?? location}\n` +
            `取貨時間：${date} ${time}\n` +
            `總金額：NT$ ${total}`,
        },
      ])
    }).catch(() => {})
  }, [])

  return null
}
