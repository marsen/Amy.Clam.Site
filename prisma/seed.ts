import { PrismaClient, PickupLocation, OrderStatus } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL })

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function weather(base: number) {
  return JSON.parse(JSON.stringify({
    temp: +(base + Math.random() * 4 - 2).toFixed(1),
    description: ['晴天', '多雲', '陰天', '短暫陣雨'][Math.floor(Math.random() * 4)],
    humidity: 65 + Math.floor(Math.random() * 25),
  }))
}

async function main() {
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()

  const products = await Promise.all([
    prisma.product.create({ data: { name: '文蛤 M 號（600g）', price: 150, isActive: true } }),   // 0
    prisma.product.create({ data: { name: '文蛤 L 號（1kg）', price: 240, isActive: true } }),    // 1
    prisma.product.create({ data: { name: '文蛤 XL 號（1.5kg）', price: 350, isActive: true } }), // 2
    prisma.product.create({ data: { name: '蛤蜊湯包（300g）', price: 120, isActive: true } }),    // 3
    prisma.product.create({ data: { name: '活蛤蜊桶裝（3kg）', price: 600, isActive: true } }),   // 4
    prisma.product.create({ data: { name: '冷凍蛤蜊（500g）', price: 100, isActive: true } }),    // 5
    prisma.product.create({ data: { name: '蛤蜊醬（瓶）', price: 180, isActive: true } }),        // 6
    prisma.product.create({ data: { name: '蛤蜊清酒蒸（即食）', price: 200, isActive: false } }), // 7
    prisma.product.create({ data: { name: '海鮮拼盤（季節限定）', price: 450, isActive: false } }),// 8
    prisma.product.create({ data: { name: '礁溪溫泉蛤蜊（禮盒）', price: 580, isActive: true } }),// 9
  ])

  type OrderDef = {
    name: string; phone: string
    location: PickupLocation; date: string; time: string
    items: [number, number][]; status?: OrderStatus
  }

  const orders: OrderDef[] = [
    // Day 0（今天）
    { name: '陳小明', phone: '0912345678', location: PickupLocation.SHINDIAN, date: daysAgo(0), time: '09:00', items: [[0, 2], [1, 1]] },
    { name: '林美華', phone: '0923456789', location: PickupLocation.NEIHU,    date: daysAgo(0), time: '16:00', items: [[1, 2], [3, 1]] },
    { name: '蘇怡婷', phone: '0933111222', location: PickupLocation.SHINDIAN, date: daysAgo(0), time: '10:00', items: [[9, 1]] },
    { name: '江柏翰', phone: '0944222333', location: PickupLocation.NEIHU,    date: daysAgo(0), time: '17:00', items: [[4, 1], [5, 2]] },

    // Day 1
    { name: '王大偉', phone: '0934567890', location: PickupLocation.SHINDIAN, date: daysAgo(1), time: '10:00', items: [[0, 3]] },
    { name: '張淑芬', phone: '0945678901', location: PickupLocation.NEIHU,    date: daysAgo(1), time: '17:30', items: [[4, 1], [6, 1]] },
    { name: '廖雅文', phone: '0955333444', location: PickupLocation.SHINDIAN, date: daysAgo(1), time: '11:00', items: [[2, 1], [3, 2]] },
    { name: '許志豪', phone: '0966444555', location: PickupLocation.NEIHU,    date: daysAgo(1), time: '15:30', items: [[1, 1], [6, 1]] },

    // Day 2
    { name: '李建國', phone: '0956789012', location: PickupLocation.SHINDIAN, date: daysAgo(2), time: '11:00', items: [[2, 1], [1, 1]] },
    { name: '黃雅婷', phone: '0967890123', location: PickupLocation.NEIHU,    date: daysAgo(2), time: '15:30', items: [[5, 2], [3, 2]] },
    { name: '賴建志', phone: '0977555666', location: PickupLocation.SHINDIAN, date: daysAgo(2), time: '09:00', items: [[0, 2], [6, 1]] },

    // Day 3
    { name: '劉志豪', phone: '0978901234', location: PickupLocation.SHINDIAN, date: daysAgo(3), time: '08:00', items: [[9, 1]] },
    { name: '吳淑惠', phone: '0912345678', location: PickupLocation.NEIHU,    date: daysAgo(3), time: '16:30', items: [[0, 4], [6, 2]] },
    { name: '鄭雅君', phone: '0921666777', location: PickupLocation.NEIHU,    date: daysAgo(3), time: '17:30', items: [[4, 1]] },
    { name: '林文山', phone: '0932777888', location: PickupLocation.SHINDIAN, date: daysAgo(3), time: '10:00', items: [[1, 2], [5, 1]] },

    // Day 4
    { name: '周淑貞', phone: '0943888999', location: PickupLocation.SHINDIAN, date: daysAgo(4), time: '09:00', items: [[0, 2], [3, 1]] },
    { name: '莊智傑', phone: '0954999000', location: PickupLocation.NEIHU,    date: daysAgo(4), time: '16:00', items: [[2, 1], [6, 2]] },
    { name: '呂佳慧', phone: '0965000111', location: PickupLocation.SHINDIAN, date: daysAgo(4), time: '11:00', items: [[1, 1], [9, 1]], status: OrderStatus.COMPLETED },

    // Day 5
    { name: '蔡文彬', phone: '0923456789', location: PickupLocation.SHINDIAN, date: daysAgo(5), time: '09:00', items: [[1, 3]], status: OrderStatus.COMPLETED },
    { name: '許雅雯', phone: '0934567890', location: PickupLocation.NEIHU,    date: daysAgo(5), time: '17:00', items: [[4, 1]], status: OrderStatus.COMPLETED },
    { name: '羅建明', phone: '0945111222', location: PickupLocation.SHINDIAN, date: daysAgo(5), time: '10:00', items: [[0, 3], [3, 2]], status: OrderStatus.COMPLETED },
    { name: '陳靜宜', phone: '0956222333', location: PickupLocation.NEIHU,    date: daysAgo(5), time: '16:30', items: [[6, 2]], status: OrderStatus.COMPLETED },

    // Day 6
    { name: '謝明宏', phone: '0967333444', location: PickupLocation.SHINDIAN, date: daysAgo(6), time: '08:00', items: [[9, 2]], status: OrderStatus.COMPLETED },
    { name: '楊雅琪', phone: '0978444555', location: PickupLocation.NEIHU,    date: daysAgo(6), time: '17:30', items: [[1, 2], [5, 2]], status: OrderStatus.COMPLETED },
    { name: '柯宜君', phone: '0912555666', location: PickupLocation.SHINDIAN, date: daysAgo(6), time: '11:00', items: [[2, 1]], status: OrderStatus.COMPLETED },

    // Day 7
    { name: '洪志明', phone: '0945678901', location: PickupLocation.SHINDIAN, date: daysAgo(7), time: '10:00', items: [[2, 2], [3, 1]], status: OrderStatus.COMPLETED },
    { name: '楊秀英', phone: '0956789012', location: PickupLocation.NEIHU,    date: daysAgo(7), time: '16:00', items: [[0, 2]], status: OrderStatus.CANCELLED },
    { name: '游文豪', phone: '0921777888', location: PickupLocation.SHINDIAN, date: daysAgo(7), time: '09:00', items: [[1, 1], [6, 1]], status: OrderStatus.COMPLETED },
    { name: '方淑娟', phone: '0932888999', location: PickupLocation.NEIHU,    date: daysAgo(7), time: '17:00', items: [[4, 1], [3, 2]], status: OrderStatus.COMPLETED },

    // Day 8
    { name: '顏志誠', phone: '0943999000', location: PickupLocation.SHINDIAN, date: daysAgo(8), time: '10:00', items: [[0, 2]], status: OrderStatus.COMPLETED },
    { name: '連雅惠', phone: '0954000111', location: PickupLocation.NEIHU,    date: daysAgo(8), time: '16:30', items: [[9, 1], [5, 1]], status: OrderStatus.COMPLETED },
    { name: '馬建國', phone: '0965111222', location: PickupLocation.SHINDIAN, date: daysAgo(8), time: '11:00', items: [[1, 2], [3, 1]], status: OrderStatus.COMPLETED },

    // Day 9
    { name: '朱美慧', phone: '0976222333', location: PickupLocation.NEIHU,    date: daysAgo(9), time: '15:30', items: [[2, 1], [6, 1]], status: OrderStatus.COMPLETED },
    { name: '葉志強', phone: '0912333444', location: PickupLocation.SHINDIAN, date: daysAgo(9), time: '09:00', items: [[0, 4]], status: OrderStatus.COMPLETED },
    { name: '潘雅玲', phone: '0923444555', location: PickupLocation.NEIHU,    date: daysAgo(9), time: '17:00', items: [[4, 1]], status: OrderStatus.COMPLETED },
    { name: '湯建宏', phone: '0934555666', location: PickupLocation.SHINDIAN, date: daysAgo(9), time: '10:00', items: [[1, 1], [6, 2]], status: OrderStatus.COMPLETED },

    // Day 10
    { name: '鄭建宏', phone: '0967890123', location: PickupLocation.SHINDIAN, date: daysAgo(10), time: '11:00', items: [[9, 2]], status: OrderStatus.COMPLETED },
    { name: '謝美玲', phone: '0978901234', location: PickupLocation.NEIHU,    date: daysAgo(10), time: '17:30', items: [[1, 1], [5, 1]], status: OrderStatus.COMPLETED },
    { name: '孫志偉', phone: '0945666777', location: PickupLocation.SHINDIAN, date: daysAgo(10), time: '08:00', items: [[0, 2], [3, 2]], status: OrderStatus.COMPLETED },

    // Day 11
    { name: '鍾美花', phone: '0956777888', location: PickupLocation.NEIHU,    date: daysAgo(11), time: '16:00', items: [[2, 1], [6, 1]], status: OrderStatus.COMPLETED },
    { name: '程建志', phone: '0967888999', location: PickupLocation.SHINDIAN, date: daysAgo(11), time: '10:00', items: [[1, 3]], status: OrderStatus.COMPLETED },
    { name: '翁淑芬', phone: '0978999000', location: PickupLocation.NEIHU,    date: daysAgo(11), time: '17:30', items: [[4, 1], [5, 2]], status: OrderStatus.COMPLETED },

    // Day 12
    { name: '曾文傑', phone: '0912000111', location: PickupLocation.SHINDIAN, date: daysAgo(12), time: '09:00', items: [[0, 2], [1, 1]], status: OrderStatus.COMPLETED },
    { name: '簡雅文', phone: '0923111222', location: PickupLocation.NEIHU,    date: daysAgo(12), time: '16:30', items: [[9, 1]], status: OrderStatus.COMPLETED },
    { name: '彭建明', phone: '0934222333', location: PickupLocation.SHINDIAN, date: daysAgo(12), time: '11:00', items: [[3, 3], [6, 1]], status: OrderStatus.COMPLETED },

    // Day 13
    { name: '柯子聖', phone: '0912345678', location: PickupLocation.SHINDIAN, date: daysAgo(13), time: '08:00', items: [[4, 2], [6, 1]], status: OrderStatus.COMPLETED },
    { name: '范淑君', phone: '0945333444', location: PickupLocation.NEIHU,    date: daysAgo(13), time: '17:00', items: [[1, 2], [3, 1]], status: OrderStatus.COMPLETED },
    { name: '戴建勳', phone: '0956444555', location: PickupLocation.SHINDIAN, date: daysAgo(13), time: '10:00', items: [[2, 1], [5, 2]], status: OrderStatus.COMPLETED },
  ]

  for (const o of orders) {
    const items = o.items.map(([pi, qty]) => ({ product: products[pi], qty }))
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
        weatherSnapshot: weather(o.location === PickupLocation.SHINDIAN ? 27 : 29),
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

main().catch(console.error).finally(() => prisma.$disconnect())
