import { relations } from "drizzle-orm/relations";
import { order, orderItem, product } from "./schema";

export const orderItemRelations = relations(orderItem, ({one}) => ({
	order: one(order, {
		fields: [orderItem.orderId],
		references: [order.id]
	}),
	product: one(product, {
		fields: [orderItem.productId],
		references: [product.id]
	}),
}));

export const orderRelations = relations(order, ({many}) => ({
	orderItems: many(orderItem),
}));

export const productRelations = relations(product, ({many}) => ({
	orderItems: many(orderItem),
}));