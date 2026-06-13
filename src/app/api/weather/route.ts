import { NextResponse } from 'next/server'

interface WeatherData {
  temp: number
  description: string
  humidity: number
}

async function fetchStation(stationId: string, apiKey: string): Promise<WeatherData> {
  if (apiKey === 'placeholder') {
    return { temp: 27 + Math.random() * 5, description: '多雲', humidity: 72 }
  }
  const res = await fetch(
    `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0001-001?Authorization=${apiKey}&StationId=${stationId}`,
    { next: { revalidate: 600 } }
  )
  const json = await res.json()
  const obs = json.records?.Station?.[0]?.WeatherElement
  return {
    temp: parseFloat(obs?.AirTemperature ?? '25'),
    description: obs?.Weather ?? '晴',
    humidity: parseInt(obs?.RelativeHumidity ?? '70', 10),
  }
}

export async function GET() {
  const apiKey = process.env.CWA_API_KEY ?? 'placeholder'
  const [shindian, neihu] = await Promise.all([
    fetchStation(process.env.CWA_STATION_ID_SHINDIAN ?? 'C0A9B0', apiKey).catch(() => null),
    fetchStation(process.env.CWA_STATION_ID_NEIHU ?? 'C0AI60', apiKey).catch(() => null),
  ])
  return NextResponse.json({ shindian, neihu })
}
