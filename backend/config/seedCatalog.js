const Product = require("../models/Product");

const seedCatalog = async () => {
  try {
    const count = await Product.countDocuments();

    if (count === 0) {
      const products = [
        {
          name: "Wireless Bluetooth Headphones",
          price: 49.99,
          description:
            "Comfortable wireless headphones with clear sound and long battery life.",
          image: "/uploads/1788843368703-989916641.jpg",
          category: "6a9e9b19aaaf52991f9e312f",
          stock: 5,
          rating: 0,
          reviews: 0,
        },

        {
          name: "Smart Watch Series X",
          price: 79.99,
          description:
            "Smartwatch with fitness tracking, heart-rate monitoring, and notifications.",
          image: "/uploads/1788843478545-740978308.jpg",
          category: "6a9e9bb6aaaf52991f9e3134",
          stock: 6,
          rating: 0,
          reviews: 0,
        },

        {
          name: "20,000mAh Power Bank",
          price: 39.99,
          description:
            "High-capacity power bank with fast charging and dual USB output.",
          image: "/uploads/1788843589495-307017333.jpg",
          category: "6a9e9bb6aaaf52991f9e3134",
          stock: 10,
          rating: 0,
          reviews: 0,
        },

        {
          name: "Wireless Gaming Mouse",
          price: 34.99,
          description:
            "Ergonomic gaming mouse with adjustable DPI and responsive wireless connection.",
          image: "/uploads/1788843740805-482733671.jpg",
          category: "6a9f96871ae6edc142cf3556",
          stock: 30,
          rating: 0,
          reviews: 0,
        },

        {
          name: "Mechanical Gaming Keyboard",
          price: 59.9,
          description:
            "RGB mechanical keyboard designed for gaming and everyday use.",
          image: "/uploads/1788843857287-422236842.jpg",
          category: "6a9f97791ae6edc142cf3559",
          stock: 46,
          rating: 0,
          reviews: 0,
        },

        {
          name: "USB-C Fast Charger",
          price: 24.99,
          description:
            "Compact fast charger compatible with smartphones, tablets, and other USB-C devices.",
          image: "/uploads/1788843999221-176890281.jpg",
          category: "6a9e9b79aaaf52991f9e3132",
          stock: 34,
          rating: 0,
          reviews: 0,
        },

        {
          name: "Portable Bluetooth Speaker",
          price: 44.99,
          description: "Portable Bluetooth Speaker",
          image: "/uploads/1788844143515-436713836.jpg",
          category: "6a9e9b19aaaf52991f9e312f",
          stock: 76,
          rating: 0,
          reviews: 0,
        },

        {
          name: '24" Full HD Monitor',
          price: 129.99,
          description:
            "Full HD LED monitor suitable for work, entertainment, and gaming.",
          image: "/uploads/1788844239320-382070081.jpg",
          category: "6a9f98f71ae6edc142cf355d",
          stock: 7,
          rating: 0,
          reviews: 0,
        },
      ];

      await Product.insertMany(products);

      console.log("✅ Catalog seeded successfully");
    } else {
      console.log("ℹ️ Products already exist, skipping seed");
    }
  } catch (error) {
    console.error("❌ Catalog seed error:", error.message);
  }
};

module.exports = seedCatalog;