// Thin service layer around the static product data.
// Every function here returns a Promise so that swapping the body
// for a real `fetch("/api/...")` call later requires no changes
// in the components that call these functions.
import {
  products,
  getProductById,
  getProductBySlug,
  getRelatedProducts,
  getFeaturedProducts,
  getBestSellers,
  getNewArrivals,
} from "../data/products";

export function fetchProducts() {
  return Promise.resolve(products);
}

export function fetchProductById(id) {
  return Promise.resolve(getProductById(id));
}

export function fetchProductBySlug(slug) {
  return Promise.resolve(getProductBySlug(slug));
}

export function fetchRelatedProducts(product, limit) {
  return Promise.resolve(getRelatedProducts(product, limit));
}

export function fetchFeaturedProducts() {
  return Promise.resolve(getFeaturedProducts());
}

export function fetchBestSellers() {
  return Promise.resolve(getBestSellers());
}

export function fetchNewArrivals() {
  return Promise.resolve(getNewArrivals());
}
