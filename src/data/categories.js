// Static category data. Later this can be replaced by an API call.
export const categories = [
  {
    id: "electronics",
    name: "Electronics",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80",
    description: "Gadgets, audio and smart devices",
  },
  {
    id: "fashion",
    name: "Fashion",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80",
    description: "Apparel for every season",
  },
  {
    id: "accessories",
    name: "Accessories",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80",
    description: "Bags, watches and jewelry",
  },
  {
    id: "home",
    name: "Home & Living",
    image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600&q=80",
    description: "Furniture and decor essentials",
  },
  {
    id: "beauty",
    name: "Beauty",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80",
    description: "Skincare and cosmetics",
  },
  {
    id: "sports",
    name: "Sports",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80",
    description: "Gear for an active lifestyle",
  },
];

export function getCategoryById(id) {
  return categories.find((c) => c.id === id);
}
