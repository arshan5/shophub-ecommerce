const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

  name: String,

  price: Number,

  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },

  description: String,

  image: String,

  images: {
    type: [String],
    default: [],
  },

  variants: {
    type: [
      {
        color: {
          type: String,
          trim: true,
        },

        stock: {
          type: Number,
          default: 0,
          min: 0,
        },

        images: {
          type: [String],
          default: [],
        },
      },
    ],
    default: [],
  },

  category: String,

  stock: {
    type: Number,
    default: 0,
    min: 0,
  },

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
  mongoose.model("Product", productSchema);

module.exports = Product;