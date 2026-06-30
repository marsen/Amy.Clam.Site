import { pgTable, timestamp, text, integer, index, jsonb, foreignKey, boolean, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

export const orderStatus = pgEnum('OrderStatus', ['PENDING', 'COMPLETED', 'CANCELLED'])
export const pickupLocation = pgEnum('PickupLocation', ['SHINDIAN', 'NEIHU'])

export const order = pgTable('Order', {
  id: text().primaryKey().notNull(),
  customerName: text().notNull(),
  customerPhone: text().notNull(),
  pickupLocation: pickupLocation().notNull(),
  pickupDate: text().notNull(),
  pickupTime: text().notNull(),
  status: orderStatus().default('PENDING').notNull(),
  totalAmount: integer().notNull(),
  weatherSnapshot: jsonb(),
  createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  index('Order_createdAt_idx').using('btree', table.createdAt.asc().nullsLast().op('timestamp_ops')),
  index('Order_customerPhone_idx').using('btree', table.customerPhone.asc().nullsLast().op('text_ops')),
  index('Order_status_idx').using('btree', table.status.asc().nullsLast().op('enum_ops')),
])

export const orderItem = pgTable('OrderItem', {
  id: text().primaryKey().notNull(),
  orderId: text().notNull(),
  productId: text().notNull(),
  productName: text().notNull(),
  productPrice: integer().notNull(),
  quantity: integer().notNull(),
  subtotal: integer().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.orderId],
    foreignColumns: [order.id],
    name: 'OrderItem_orderId_fkey',
  }).onUpdate('cascade').onDelete('restrict'),
  foreignKey({
    columns: [table.productId],
    foreignColumns: [product.id],
    name: 'OrderItem_productId_fkey',
  }).onUpdate('cascade').onDelete('restrict'),
])

export const product = pgTable('Product', {
  id: text().primaryKey().notNull(),
  name: text().notNull(),
  price: integer().notNull(),
  imageUrl: text(),
  isActive: boolean().default(true).notNull(),
  createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
})

export const orderRelations = relations(order, ({ many }) => ({
  items: many(orderItem),
}))

export const orderItemRelations = relations(orderItem, ({ one }) => ({
  order: one(order, { fields: [orderItem.orderId], references: [order.id] }),
  product: one(product, { fields: [orderItem.productId], references: [product.id] }),
}))

export const productRelations = relations(product, ({ many }) => ({
  orderItems: many(orderItem),
}))

// 匯出類型供應用層使用
export type OrderStatus = typeof orderStatus.enumValues[number]
export type PickupLocation = typeof pickupLocation.enumValues[number]
