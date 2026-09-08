import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "../context/CartContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const sessionId = searchParams.get("session_id");
  const oldOrderId = searchParams.get("orderId");
  const oldTotal = Number(searchParams.get("total") || 0);

  const [loading, setLoading] = useState(Boolean(sessionId));
  const [orderId, setOrderId] = useState(oldOrderId || "");
  const [total, setTotal] = useState(oldTotal);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyStripePayment = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("shophub_token");

        if (!token) {
          throw new Error(
            "Your session has expired. Please login again."
          );
        }

        // Prevent duplicate order creation if page is refreshed
        const existingOrder = sessionStorage.getItem(
          `stripe_order_${sessionId}`
        );

        if (existingOrder) {
          const savedOrder = JSON.parse(existingOrder);

          setOrderId(savedOrder.orderId);
          setTotal(Number(savedOrder.total || 0));

          clearCart();
          setLoading(false);

          return;
        }

        // Get order information saved before Stripe redirect
        const savedCheckoutData =
          sessionStorage.getItem("shophub_stripe_order");

        if (!savedCheckoutData) {
          throw new Error(
            "Checkout information was not found."
          );
        }

        const checkoutData =
          JSON.parse(savedCheckoutData);

        // Verify Stripe payment
        const verifyResponse = await fetch(
          `${API_URL}/api/stripe/verify-session/${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const verifyData = await verifyResponse.json();

        if (!verifyResponse.ok) {
          throw new Error(
            verifyData.message ||
              "Unable to verify Stripe payment."
          );
        }

        if (!verifyData.paid) {
          throw new Error(
            "Stripe payment was not completed."
          );
        }

        // Create MongoDB order
        const orderData = {
          customer: checkoutData.customer,
          items: checkoutData.items,

          subtotal: Number(
            checkoutData.subtotal.toFixed(2)
          ),

          delivery: Number(
            checkoutData.delivery.toFixed(2)
          ),

          tax: Number(
            checkoutData.tax.toFixed(2)
          ),

          total: Number(
            checkoutData.total.toFixed(2)
          ),

          deliveryMethod:
            checkoutData.deliveryMethod,

          paymentMethod: "card",
        };

        const orderResponse = await fetch(
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

        const orderResult =
          await orderResponse.json();

        if (!orderResponse.ok) {
          throw new Error(
            orderResult.message ||
              "Payment succeeded, but order creation failed."
          );
        }

        const createdOrder = orderResult.order;

        if (!createdOrder?._id) {
          throw new Error(
            "Order was created but order information was not returned."
          );
        }

        // Save result so refresh doesn't create another order
        sessionStorage.setItem(
          `stripe_order_${sessionId}`,
          JSON.stringify({
            orderId: createdOrder._id,
            total: createdOrder.total,
          })
        );

        // Remove temporary checkout data
        sessionStorage.removeItem(
          "shophub_stripe_order"
        );

        // Clear shopping cart
        clearCart();

        // Update page
        setOrderId(createdOrder._id);
        setTotal(Number(createdOrder.total || 0));
      } catch (error) {
        console.error(
          "Stripe order verification error:",
          error
        );

        setError(
          error.message ||
            "Unable to complete your order."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyStripePayment();
  }, [sessionId, clearCart]);

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="container">
        <div className="order-success">
          <h1>Processing Your Payment...</h1>

          <p className="text-muted">
            Please wait while we confirm your
            payment and create your order.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // Error
  // ==========================================

  if (error) {
    return (
      <div className="container">
        <div className="order-success">
          <h1>Payment Verification Failed</h1>

          <p className="text-muted">
            {error}
          </p>

          <div
            className="flex gap-12"
            style={{
              justifyContent: "center",
            }}
          >
            <Link
              to="/checkout"
              className="btn btn-primary"
            >
              Back to Checkout
            </Link>

            <Link
              to="/account/orders"
              className="btn btn-outline"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // Success
  // ==========================================

  return (
    <div className="container">
      <div className="order-success">

        <CheckCircle2
          size={64}
          color="var(--color-success)"
        />

        <h1>
          Order Placed Successfully!
        </h1>

        <p className="text-muted">
          Thank you for your order. Your order has
          been successfully placed.
        </p>

        {orderId && (
          <p className="text-muted">
            Order ID:{" "}
            <strong>#{orderId}</strong>
          </p>
        )}

        <p className="order-success-total">
          Total: ${total.toFixed(2)}
        </p>

        <p className="form-hint mb-16">
          A confirmation email has been sent to
          your registered email address.
        </p>

        <div
          className="flex gap-12"
          style={{
            justifyContent: "center",
          }}
        >
          <Link
            to="/shop"
            className="btn btn-outline"
          >
            Continue Shopping
          </Link>

          <Link
            to="/account/orders"
            className="btn btn-primary"
          >
            View My Orders
          </Link>
        </div>

      </div>
    </div>
  );
}