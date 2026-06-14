import { PrismaClient, PickupLocation, OrderStatus } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL })

const CUSTOMERS = [
  { name: '陳小明', phone: '0912345678' }, { name: '林美華', phone: '0923456789' },
  { name: '王大偉', phone: '0934567890' }, { name: '張淑芬', phone: '0945678901' },
  { name: '李建國', phone: '0956789012' }, { name: '黃雅婷', phone: '0967890123' },
  { name: '劉志豪', phone: '0978901234' }, { name: '吳淑惠', phone: '0989012345' },
  { name: '蔡文彬', phone: '0912111222' }, { name: '許雅雯', phone: '0923222333' },
  { name: '洪志明', phone: '0934333444' }, { name: '楊秀英', phone: '0945444555' },
  { name: '鄭建宏', phone: '0956555666' }, { name: '謝美玲', phone: '0967666777' },
  { name: '柯子聖', phone: '0978777888' }, { name: '廖雅文', phone: '0912888999' },
  { name: '江柏翰', phone: '0923999000' }, { name: '蘇怡婷', phone: '0934000111' },
  { name: '周淑貞', phone: '0945111222' }, { name: '莊智傑', phone: '0956222333' },
  { name: '游文豪', phone: '0967333444' }, { name: '方淑娟', phone: '0978444555' },
  { name: '賴建志', phone: '0912555666' }, { name: '羅建明', phone: '0923666777' },
  { name: '潘雅玲', phone: '0934777888' }, { name: '孫志偉', phone: '0945888999' },
]

const SHINDIAN_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00']
const NEIHU_SLOTS    = ['15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30']

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }

function dateAt(daysAgo: number, hour = 10): Date {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, rand(0, 59), rand(0, 59), 0)
  return d
}

function pickupDateStr(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

function weather(loc: PickupLocation) {
  const base = loc === PickupLocation.SHINDIAN ? 26 : 29
  const descs = ['晴天', '多雲', '陰天', '短暫陣雨', '晴時多雲']
  return JSON.parse(JSON.stringify({
    temp: +(base + (Math.random() * 6 - 3)).toFixed(1),
    description: pick(descs),
    humidity: rand(60, 88),
  }))
}

async function main() {
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()

  const products = await Promise.all([
    prisma.product.create({ data: { name: '文蛤 M 號（600g）',      price: 150, isActive: true  } }),  // 0
    prisma.product.create({ data: { name: '文蛤 L 號（1kg）',        price: 240, isActive: true  } }),  // 1
    prisma.product.create({ data: { name: '文蛤 XL 號（1.5kg）',     price: 350, isActive: true  } }),  // 2
    prisma.product.create({ data: { name: '蛤蜊湯包（300g）',        price: 120, isActive: true  } }),  // 3
    prisma.product.create({ data: { name: '活蛤蜊桶裝（3kg）',       price: 600, isActive: true  } }),  // 4
    prisma.product.create({ data: { name: '冷凍蛤蜊（500g）',        price: 100, isActive: true  } }),  // 5
    prisma.product.create({ data: { name: '蛤蜊醬（瓶）',            price: 180, isActive: true  } }),  // 6
    prisma.product.create({ data: { name: '蛤蜊清酒蒸（即食）',      price: 200, isActive: false } }),  // 7
    prisma.product.create({ data: { name: '海鮮拼盤（季節限定）',    price: 450, isActive: false } }),  // 8
    prisma.product.create({ data: { name: '礁溪溫泉蛤蜊（禮盒）',   price: 580, isActive: true  } }),  // 9
  ])

  let total = 0

  for (let day = 90; day >= 0; day--) {
    const ordersPerDay = rand(2, 5)

    for (let i = 0; i < ordersPerDay; i++) {
      const loc = Math.random() < 0.5 ? PickupLocation.SHINDIAN : PickupLocation.NEIHU
      const customer = pick(CUSTOMERS)
      const createdAt = dateAt(day, rand(8, 20))

      // 隨機選 1–3 種商品
      const activeProducts = products.filter(p => p.isActive)
      const itemCount = rand(1, 3)
      const chosen = [...activeProducts].sort(() => Math.random() - 0.5).slice(0, itemCount)
      const orderItems = chosen.map(p => ({ product: p, qty: rand(1, 3) }))
      const totalAmount = orderItems.reduce((s, { product, qty }) => s + product.price * qty, 0)

      // 舊訂單多為 COMPLETED，最近 3 天為 PENDING
      const status = day === 0
        ? OrderStatus.PENDING
        : day <= 2
          ? Math.random() < 0.6 ? OrderStatus.PENDING : OrderStatus.COMPLETED
          : Math.random() < 0.08 ? OrderStatus.CANCELLED : OrderStatus.COMPLETED

      await prisma.order.create({
        data: {
          customerName:    customer.name,
          customerPhone:   customer.phone,
          pickupLocation:  loc,
          pickupDate:      pickupDateStr(day - 1),
          pickupTime:      pick(loc === PickupLocation.SHINDIAN ? SHINDIAN_SLOTS : NEIHU_SLOTS),
          status,
          totalAmount,
          weatherSnapshot: weather(loc),
          createdAt,
          items: {
            create: orderItems.map(({ product, qty }) => ({
              productId:    product.id,
              productName:  product.name,
              productPrice: product.price,
              quantity:     qty,
              subtotal:     product.price * qty,
            })),
          },
        },
      })
      total++
    }
  }

  console.log(`✅ Seeded ${products.length} products, ${total} orders across 91 days`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
