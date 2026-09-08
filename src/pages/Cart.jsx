import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, Heart, ShoppingBag } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import EmptyState from "../components/EmptyState";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import { getProductById } from "../data/products";
import "./Cart.css";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();
  const { toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const shipping = items.length === 0 ? 0 : subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;

  const handleMoveToWishlist = (item) => {
    const product = getProductById(item.id);
    if (product) toggleWishlist(product);
    removeFromCart(item.id, item.color, item.size);
    showToast(`${item.name} moved to wishlist`, "success");
  };

  return (
    <div className="container">
      <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Cart" }]} />
      <h1 className="mb-16">Shopping Cart</h1>

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={48} />}
          title="Your cart is empty"
          message="Looks like you haven't added anything yet."
          actionLabel="Continue Shopping"
          actionTo="/shop"
        />
      ) : (
        <div className="cart-layout section">
          <div className="cart-items">
            {items.map((item) => (
              <div key={`${item.id}-${item.color}-${item.size}`} className="cart-item">
                <Link to={`/product/${item.id}`} className="cart-item-image">
                  <img src={item.image} alt={item.name} />
                </Link>
                <div className="cart-item-info">
                  <Link to={`/product/${item.id}`}>
                    <h3>{item.name}</h3>
                  </Link>
                  <p className="text-muted">
                    {item.color && `Color: ${item.color}`} {item.size && `· Size: ${item.size}`}
                  </p>
                  <span className="price-current">${item.price.toFixed(2)}</span>

                  <div className="cart-item-mobile-controls">
                    <div className="quantity-control">
                      <button onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity - 1)}>
                        <Minus size={13} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity + 1)}>
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <button onClick={() => handleMoveToWishlist(item)}>
                      <Heart size={14} /> Move to Wishlist
                    </button>
                    <button onClick={() => removeFromCart(item.id, item.color, item.size)} className="danger-link">
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>

                <div className="cart-item-quantity">
                  <div className="quantity-control">
                    <button onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity - 1)}>
                      <Minus size={13} />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity + 1)}>
                      <Plus size={13} />
                    </button>
                  </div>
                </div>

                <div className="cart-item-subtotal">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}

            <Link to="/shop" className="text-link">
              ← Continue Shopping
            </Link>
          </div>

          <aside className="cart-summary card card-pad">
            <h3 className="mb-16">Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="summary-row">
              <span>Tax (5%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-block btn-lg mt-16">
              Proceed to Checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
