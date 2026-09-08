const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: "ShopHub",
    },

    storeEmail: {
      type: String,
      default: "support@shophub.com",
    },

    currency: {
      type: String,
      enum: ["USD", "EUR", "PKR"],
      default: "USD",
    },

    lowStockAlert: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Setting",
  settingSchema
);