const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,

  price: Number,

  description: String,

  image: String,

  category: String,

  stock: Number,

  rating: {
    type: Number,
    default: 0,
  },

  reviews: {
    type: Number,
    default: 0,
  },
});

const Product =
  mongoose.model(
    "Product",
    productSchema
  );

module.exports = Product;