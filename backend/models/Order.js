const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: {
      email: String,
      firstName: String,
      lastName: String,
      address: String,
      city: String,
      country: String,
      postalCode: String,
      phone: String,
    },

    items: [
      {
        productId: String,
        name: String,
        image: String,
        price: Number,
        quantity: Number,
        color: String,
        size: String,
      },
    ],

    subtotal: Number,
    delivery: Number,
    tax: Number,
    total: Number,

    deliveryMethod: String,
    paymentMethod: String,

    status: {
      type: String,
      default: "pending",
    },

    // Admin note, especially useful for cancelled orders
    note: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;