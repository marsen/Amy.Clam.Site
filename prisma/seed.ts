import { PrismaClient, PickupLocation, OrderStatus } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL })

async function main() {
  // 清空舊資料
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()

  // 商品
  const products = await Promise.all([
    prisma.product.create({ data: { name: '文蛤 M 號（600g）', price: 150, isActive: true } }),
    prisma.product.create({ data: { name: '文蛤 L 號（1kg）', price: 240, isActive: true } }),
    prisma.product.create({ data: { name: '文蛤 XL 號（1.5kg）', price: 350, isActive: true } }),
    prisma.product.create({ data: { name: '蛤蜊湯包（300g）', price: 120, isActive: true } }),
    prisma.product.create({ data: { name: '活蛤蜊桶裝（3kg）', price: 600, isActive: true } }),
    prisma.product.create({ data: { name: '冷凍蛤蜊（500g）', price: 100, isActive: true } }),
    prisma.product.create({ data: { name: '蛤蜊醬（瓶）', price: 180, isActive: true } }),
    prisma.product.create({ data: { name: '蛤蜊清酒蒸（即食）', price: 200, isActive: false } }),
    prisma.product.create({ data: { name: '海鮮拼盤（季節限定）', price: 450, isActive: false } }),
    prisma.product.create({ data: { name: '礁溪溫泉蛤蜊（禮盒）', price: 580, isActive: true } }),
  ])

  // 假訂單（近 14 天）
  const now = new Date()
  const orders = [
    { name: '陳小明', phone: '0912345678', location: PickupLocation.SHINDIAN, date: daysAgo(0), time: '09:00', items: [[0, 2], [1, 1]] },
    { name: '林美華', phone: '0923456789', location: PickupLocation.NEIHU, date: daysAgo(0), time: '16:00', items: [[1, 2], [3, 1]] },
    { name: '王大偉', phone: '0934567890', location: PickupLocation.SHINDIAN, date: daysAgo(1), time: '10:00', items: [[0, 3]] },
    { name: '張淑芬', phone: '0945678901', location: PickupLocation.NEIHU, date: daysAgo(1), time: '17:30', items: [[4, 1], [6, 1]] },
    { name: '李建國', phone: '0956789012', location: PickupLocation.SHINDIAN, date: daysAgo(2), time: '11:00', items: [[2, 1], [1, 1]] },
    { name: '黃雅婷', phone: '0967890123', location: PickupLocation.NEIHU, date: daysAgo(2), time: '15:30', items: [[5, 2], [3, 2]] },
    { name: '劉志豪', phone: '0978901234', location: PickupLocation.SHINDIAN, date: daysAgo(3), time: '08:00', items: [[9, 1]] },
    { name: '吳淑惠', phone: '0912345678', location: PickupLocation.NEIHU, date: daysAgo(3), time: '16:30', items: [[0, 4], [6, 2]] },
    { name: '蔡文彬', phone: '0923456789', location: PickupLocation.SHINDIAN, date: daysAgo(5), time: '09:00', items: [[1, 3]], status: OrderStatus.COMPLETED },
    { name: '許雅雯', phone: '0934567890', location: PickupLocation.NEIHU, date: daysAgo(5), time: '17:00', items: [[4, 1]], status: OrderStatus.COMPLETED },
    { name: '洪志明', phone: '0945678901', location: PickupLocation.SHINDIAN, date: daysAgo(7), time: '10:00', items: [[2, 2], [3, 1]], status: OrderStatus.COMPLETED },
    { name: '楊秀英', phone: '0956789012', location: PickupLocation.NEIHU, date: daysAgo(7), time: '16:00', items: [[0, 2]], status: OrderStatus.CANCELLED },
    { name: '鄭建宏', phone: '0967890123', location: PickupLocation.SHINDIAN, date: daysAgo(10), time: '11:00', items: [[9, 2]], status: OrderStatus.COMPLETED },
    { name: '謝美玲', phone: '0978901234', location: PickupLocation.NEIHU, date: daysAgo(10), time: '17:30', items: [[1, 1], [5, 1]], status: OrderStatus.COMPLETED },
    { name: '柯子聖', phone: '0912345678', location: PickupLocation.SHINDIAN, date: daysAgo(13), time: '08:00', items: [[4, 2], [6, 1]], status: OrderStatus.COMPLETED },
  ]

  for (const o of orders) {
    const items = o.items.map(([pi, qty]) => ({
      product: products[pi],
      qty,
    }))
    const totalAmount = items.reduce((s, { product, qty }) => s + product.price * qty, 0)

    await prisma.order.create({
      data: {
        customerName: o.name,
        customerPhone: o.phone,
        pickupLocation: o.location,
        pickupDate: o.date,
        pickupTime: o.time,
        status: o.status ?? OrderStatus.PENDING,
        totalAmount,
        weatherSnapshot: JSON.stringify({ temp: +(25 + Math.random() * 8).toFixed(1), description: '多雲', humidity: 70 + Math.floor(Math.random() * 20) }),
        items: {
          create: items.map(({ product, qty }) => ({
            productId: product.id,
            productName: product.name,
            productPrice: product.price,
            quantity: qty,
            subtotal: product.price * qty,
          })),
        },
      },
    })
  }

  console.log(`✅ Seeded ${products.length} products, ${orders.length} orders`)
}

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

main().catch(console.error).finally(() => prisma.$disconnect())
