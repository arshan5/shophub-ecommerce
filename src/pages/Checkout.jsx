import { useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  CreditCard,
  Truck,
  Banknote,
} from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import { useCart } from "../context/CartContext";
import "./Checkout.css";

const API_URL = "http://localhost:5000";

const deliveryOptions = [
  {
    id: "standard",
    label: "Standard Delivery",
    time: "5-7 business days",
    price: 0,
  },
  {
    id: "express",
    label: "Express Delivery",
    time: "2-3 business days",
    price: 9.99,
  },
];

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: user?.email || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [delivery, setDelivery] = useState("standard");
  const [payment, setPayment] = useState("cod");
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // ==========================================
  // Empty Cart
  // ==========================================

  if (items.length === 0 && !orderPlaced) {
    return <Navigate to="/cart" replace />;
  }

  // ==========================================
  // Login Required
  // ==========================================

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // ==========================================
  // Delivery Calculation
  // ==========================================

  const selectedDelivery = deliveryOptions.find(
    (option) => option.id === delivery
  );

  const deliveryPrice = selectedDelivery?.price || 0;

  const tax = subtotal * 0.05;

  const total = subtotal + deliveryPrice + tax;

  // ==========================================
  // Handle Input
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // ==========================================
  // Validation
  // ==========================================

  const validate = () => {
    const errs = {};

    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = "Enter a valid email";
    }

    if (!form.firstName.trim()) {
      errs.firstName = "First name is required";
    }

    if (!form.lastName.trim()) {
      errs.lastName = "Last name is required";
    }

    if (!form.address.trim()) {
      errs.address = "Address is required";
    }

    if (!form.city.trim()) {
      errs.city = "City is required";
    }

    if (!form.country.trim()) {
      errs.country = "Country is required";
    }

    if (!form.postalCode.trim()) {
      errs.postalCode = "Postal code is required";
    }

    if (!form.phone.trim()) {
      errs.phone = "Phone number is required";
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  // ==========================================
  // Prepare Order Items
  // ==========================================

  const getOrderItems = () => {
    return items.map((item) => ({
      productId: item.id || item._id,
      name: item.name,
      image: item.image || "",
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      color: item.color || "",
      size: item.size || "",
    }));
  };

  // ==========================================
  // Prepare Customer
  // ==========================================

  const getCustomer = () => {
    return {
      email: form.email.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      postalCode: form.postalCode.trim(),
      phone: form.phone.trim(),
    };
  };

  // ==========================================
  // CASH ON DELIVERY
  // ==========================================

  const placeCashOrder = async () => {
    const token = localStorage.getItem("shophub_token");

    if (!token) {
      throw new Error(
        "Your session has expired. Please login again."
      );
    }

    const orderData = {
      customer: getCustomer(),
      items: getOrderItems(),

      subtotal: Number(subtotal.toFixed(2)),
      delivery: Number(deliveryPrice.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),

      deliveryMethod: delivery,
      paymentMethod: "cod",
    };

    console.log("Creating COD order:", orderData);

    const response = await fetch(
      `${API_URL}/api/orders`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(orderData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to place order."
      );
    }

    const createdOrder = data.order;

    if (!createdOrder?._id) {
      throw new Error(
        "Order was created but order information was not returned."
      );
    }

    setOrderPlaced(true);

    clearCart();

    navigate(
      `/order-success?orderId=${createdOrder._id}&total=${createdOrder.total}`,
      {
        replace: true,
      }
    );
  };

  // ==========================================
  // STRIPE CHECKOUT
  // ==========================================

  const startStripeCheckout = async () => {
    const token = localStorage.getItem("shophub_token");

    if (!token) {
      throw new Error(
        "Your session has expired. Please login again."
      );
    }

    const stripeData = {
      customer: getCustomer(),
      items: getOrderItems(),

      subtotal: Number(subtotal.toFixed(2)),
      delivery: Number(deliveryPrice.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),

      deliveryMethod: delivery,
    };

    console.log(
      "Creating Stripe Checkout session:",
      stripeData
    );
    sessionStorage.setItem(
  "shophub_stripe_order",
  JSON.stringify(stripeData)
);

    const response = await fetch(
      `${API_URL}/api/stripe/create-checkout-session`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(stripeData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Unable to start Stripe payment."
      );
    }

    if (!data.url) {
      throw new Error(
        "Stripe payment URL was not returned."
      );
    }

    // Open Stripe Checkout
    window.location.href = data.url;
  };

  // ==========================================
  // PLACE ORDER
  // ==========================================

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setPlacing(true);

    try {
      if (payment === "card") {
        await startStripeCheckout();
      } else {
        await placeCashOrder();
      }
    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      alert(
        error.message ||
          "Something went wrong. Please try again."
      );

      setPlacing(false);
    }
  };

  return (
    <div className="container">

      {/* Breadcrumb */}

      <Breadcrumb
        items={[
          {
            label: "Home",
            to: "/",
          },
          {
            label: "Cart",
            to: "/cart",
          },
          {
            label: "Checkout",
          },
        ]}
      />

      <h1 className="mb-16">
        Checkout
      </h1>

      <form
        className="checkout-layout section"
        onSubmit={handlePlaceOrder}
      >

        {/* =====================================
            LEFT SIDE
        ====================================== */}

        <div className="checkout-form">

          {/* Contact Information */}

          <div className="checkout-section">

            <h3>
              Contact Information
            </h3>

            <div className="form-group">

              <label className="form-label">
                Email Address
              </label>

              <input
                className={`form-control ${
                  errors.email
                    ? "has-error"
                    : ""
                }`}
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />

              {errors.email && (
                <p className="form-error">
                  {errors.email}
                </p>
              )}

            </div>

          </div>

          {/* Shipping Address */}

          <div className="checkout-section">

            <h3>
              Shipping Address
            </h3>

            <div className="form-row">

              {/* First Name */}

              <div className="form-group">

                <label className="form-label">
                  First Name
                </label>

                <input
                  className={`form-control ${
                    errors.firstName
                      ? "has-error"
                      : ""
                  }`}
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="John"
                />

                {errors.firstName && (
                  <p className="form-error">
                    {errors.firstName}
                  </p>
                )}

              </div>

              {/* Last Name */}

              <div className="form-group">

                <label className="form-label">
                  Last Name
                </label>

                <input
                  className={`form-control ${
                    errors.lastName
                      ? "has-error"
                      : ""
                  }`}
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                />

                {errors.lastName && (
                  <p className="form-error">
                    {errors.lastName}
                  </p>
                )}

              </div>

            </div>

            {/* Address */}

            <div className="form-group">

              <label className="form-label">
                Street Address
              </label>

              <input
                className={`form-control ${
                  errors.address
                    ? "has-error"
                    : ""
                }`}
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="221 Maple Street"
              />

              {errors.address && (
                <p className="form-error">
                  {errors.address}
                </p>
              )}

            </div>

            {/* City + Country */}

            <div className="form-row">

              <div className="form-group">

                <label className="form-label">
                  City
                </label>

                <input
                  className={`form-control ${
                    errors.city
                      ? "has-error"
                      : ""
                  }`}
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="New York"
                />

                {errors.city && (
                  <p className="form-error">
                    {errors.city}
                  </p>
                )}

              </div>

              <div className="form-group">

                <label className="form-label">
                  Country
                </label>

                <input
                  className={`form-control ${
                    errors.country
                      ? "has-error"
                      : ""
                  }`}
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="United States"
                />

                {errors.country && (
                  <p className="form-error">
                    {errors.country}
                  </p>
                )}

              </div>

            </div>

            {/* Postal Code + Phone */}

            <div className="form-row">

              <div className="form-group">

                <label className="form-label">
                  Postal Code
                </label>

                <input
                  className={`form-control ${
                    errors.postalCode
                      ? "has-error"
                      : ""
                  }`}
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="10001"
                />

                {errors.postalCode && (
                  <p className="form-error">
                    {errors.postalCode}
                  </p>
                )}

              </div>

              <div className="form-group">

                <label className="form-label">
                  Phone Number
                </label>

                <input
                  className={`form-control ${
                    errors.phone
                      ? "has-error"
                      : ""
                  }`}
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 890"
                />

                {errors.phone && (
                  <p className="form-error">
                    {errors.phone}
                  </p>
                )}

              </div>

            </div>

          </div>

          {/* Delivery Method */}

          <div className="checkout-section">

            <h3>
              Delivery Method
            </h3>

            {deliveryOptions.map((opt) => (

              <label
                key={opt.id}
                className={`radio-card ${
                  delivery === opt.id
                    ? "active"
                    : ""
                }`}
              >

                <input
                  type="radio"
                  name="delivery"
                  checked={
                    delivery === opt.id
                  }
                  onChange={() =>
                    setDelivery(opt.id)
                  }
                />

                <Truck size={18} />

                <div className="radio-card-info">

                  <strong>
                    {opt.label}
                  </strong>

                  <span>
                    {opt.time}
                  </span>

                </div>

                <span className="radio-card-price">

                  {opt.price === 0
                    ? "Free"
                    : `$${opt.price.toFixed(2)}`}

                </span>

              </label>

            ))}

          </div>

          {/* Payment Method */}

          <div className="checkout-section">

            <h3>
              Payment Method
            </h3>

            {/* Card */}

            <label
              className={`radio-card ${
                payment === "card"
                  ? "active"
                  : ""
              }`}
            >

              <input
                type="radio"
                name="payment"
                checked={
                  payment === "card"
                }
                onChange={() =>
                  setPayment("card")
                }
              />

              <CreditCard size={18} />

              <div className="radio-card-info">

                <strong>
                  Credit / Debit Card
                </strong>

                <span>
                  Visa, Mastercard,
                  American Express
                </span>

              </div>

            </label>

            {/* COD */}

            <label
              className={`radio-card ${
                payment === "cod"
                  ? "active"
                  : ""
              }`}
            >

              <input
                type="radio"
                name="payment"
                checked={
                  payment === "cod"
                }
                onChange={() =>
                  setPayment("cod")
                }
              />

              <Banknote size={18} />

              <div className="radio-card-info">

                <strong>
                  Cash on Delivery
                </strong>

                <span>
                  Pay when your order arrives
                </span>

              </div>

            </label>

            {/* Stripe Message */}

            {payment === "card" && (

              <p className="form-hint">
                You will be redirected to
                Stripe's secure checkout page
                to complete your payment.
              </p>

            )}

          </div>

        </div>

        {/* =====================================
            RIGHT SIDE
        ====================================== */}

        <aside className="checkout-summary card card-pad">

          <h3 className="mb-16">
            Order Summary
          </h3>

          {/* Products */}

          <div className="checkout-summary-items">

            {items.map((item) => (

              <div
                key={`${item.id || item._id}-${
                  item.color || ""
                }-${item.size || ""}`}
                className="checkout-summary-item"
              >

                <img
                  src={
                    item.image ||
                    "https://via.placeholder.com/100x100?text=Product"
                  }
                  alt={item.name}
                />

                <div>

                  <p>
                    {item.name}
                  </p>

                  {item.color && (
                    <span className="text-muted">
                      Color: {item.color}
                    </span>
                  )}

                  {item.size && (
                    <span className="text-muted">
                      Size: {item.size}
                    </span>
                  )}

                  <span className="text-muted">
                    Qty: {item.quantity}
                  </span>

                </div>

                <span>
                  $
                  {(
                    Number(item.price || 0) *
                    Number(item.quantity || 1)
                  ).toFixed(2)}
                </span>

              </div>

            ))}

          </div>

          {/* Subtotal */}

          <div className="summary-row">

            <span>
              Subtotal
            </span>

            <span>
              ${subtotal.toFixed(2)}
            </span>

          </div>

          {/* Delivery */}

          <div className="summary-row">

            <span>
              Delivery
            </span>

            <span>
              {deliveryPrice === 0
                ? "Free"
                : `$${deliveryPrice.toFixed(2)}`}
            </span>

          </div>

          {/* Tax */}

          <div className="summary-row">

            <span>
              Tax (5%)
            </span>

            <span>
              ${tax.toFixed(2)}
            </span>

          </div>

          {/* Total */}

          <div className="summary-row summary-total">

            <span>
              Total
            </span>

            <span>
              ${total.toFixed(2)}
            </span>

          </div>

          {/* Button */}

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg mt-16"
            disabled={placing}
          >

            {placing
              ? payment === "card"
                ? "Opening Payment..."
                : "Placing Order..."
              : payment === "cod"
              ? "Place Order"
              : "Continue to Payment"}

          </button>

        </aside>

      </form>

    </div>
  );
}