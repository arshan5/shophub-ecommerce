// Static mock order data for the account and admin areas.
import { products } from "./products";

export const orders = [
  {
    id: "ORD-10025",
    date: "2026-08-28",
    status: "Delivered",
    paymentStatus: "Paid",
    paymentMethod: "Credit Card",
    customer: { name: "Umer Farooq", email: "muhammadumerfarooqm70@gmail.com" },
    shippingAddress: {
      line1: "221 Maple Street",
      city: "Lahore",
      country: "Pakistan",
      postalCode: "54000",
      phone: "+92 300 1234567",
    },
    items: [
      { productId: 1, quantity: 1, price: 179.99 },
      { productId: 6, quantity: 1, price: 39.0 },
    ],
    subtotal: 218.99,
    shipping: 0,
    tax: 10.95,
    total: 229.94,
    timeline: [
      { step: "Order Placed", date: "2026-08-24", done: true },
      { step: "Confirmed", date: "2026-08-24", done: true },
      { step: "Shipped", date: "2026-08-26", done: true },
      { step: "Delivered", date: "2026-08-28", done: true },
    ],
  },
  {
    id: "ORD-10041",
    date: "2026-08-31",
    status: "Shipped",
    paymentStatus: "Paid",
    paymentMethod: "Cash on Delivery",
    customer: { name: "Umer Farooq", email: "muhammadumerfarooqm70@gmail.com" },
    shippingAddress: {
      line1: "221 Maple Street",
      city: "Lahore",
      country: "Pakistan",
      postalCode: "54000",
      phone: "+92 300 1234567",
    },
    items: [{ productId: 11, quantity: 1, price: 119.99 }],
    subtotal: 119.99,
    shipping: 5.99,
    tax: 6.0,
    total: 131.98,
    timeline: [
      { step: "Order Placed", date: "2026-08-30", done: true },
      { step: "Confirmed", date: "2026-08-30", done: true },
      { step: "Shipped", date: "2026-08-31", done: true },
      { step: "Delivered", date: "", done: false },
    ],
  },
  {
    id: "ORD-10058",
    date: "2026-09-02",
    status: "Processing",
    paymentStatus: "Pending",
    paymentMethod: "Credit Card",
    customer: { name: "Umer Farooq", email: "muhammadumerfarooqm70@gmail.com" },
    shippingAddress: {
      line1: "221 Maple Street",
      city: "Lahore",
      country: "Pakistan",
      postalCode: "54000",
      phone: "+92 300 1234567",
    },
    items: [
      { productId: 2, quantity: 1, price: 249.0 },
      { productId: 5, quantity: 2, price: 49.99 },
    ],
    subtotal: 348.98,
    shipping: 0,
    tax: 17.45,
    total: 366.43,
    timeline: [
      { step: "Order Placed", date: "2026-09-02", done: true },
      { step: "Confirmed", date: "2026-09-02", done: true },
      { step: "Shipped", date: "", done: false },
      { step: "Delivered", date: "", done: false },
    ],
  },
];

export function getOrderItemsWithProduct(order) {
  return order.items.map((item) => ({
    ...item,
    product: products.find((p) => p.id === item.productId),
  }));
}

export function getOrderById(id) {
  return orders.find((o) => o.id === id);
}

// Mock orders for the admin panel — a broader list across many customers.
export const adminOrders = [
  { id: "ORD-10025", customer: "Umer Farooq", date: "2026-08-28", total: 229.94, payment: "Paid", status: "Delivered" },
  { id: "ORD-10041", customer: "Umer Farooq", date: "2026-08-31", total: 131.98, payment: "Paid", status: "Shipped" },
  { id: "ORD-10058", customer: "Umer Farooq", date: "2026-09-02", total: 366.43, payment: "Pending", status: "Processing" },
  { id: "ORD-10061", customer: "Sara Khan", date: "2026-09-01", total: 89.99, payment: "Paid", status: "Confirmed" },
  { id: "ORD-10063", customer: "Ali Raza", date: "2026-08-30", total: 449.5, payment: "Paid", status: "Delivered" },
  { id: "ORD-10067", customer: "Emily Chen", date: "2026-08-29", total: 59.99, payment: "Failed", status: "Cancelled" },
  { id: "ORD-10070", customer: "James Wilson", date: "2026-09-02", total: 199.99, payment: "Pending", status: "Pending" },
  { id: "ORD-10073", customer: "Fatima Noor", date: "2026-08-27", total: 149.0, payment: "Paid", status: "Delivered" },
];
