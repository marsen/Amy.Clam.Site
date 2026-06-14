'use client'

import { useEffect } from 'react'

export function LiffProvider({ liffId }: { liffId: string }) {
  useEffect(() => {
    if (!liffId || liffId === 'placeholder') return
    import('@line/liff').then(({ default: liff }) => {
      liff.init({ liffId }).catch(console.error)
    })
  }, [liffId])

  return null
}
