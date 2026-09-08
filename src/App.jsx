import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AccountLayout from "./layouts/AccountLayout";
import AdminLayout from "./admin/AdminLayout";

import AdminProtectedRoute from "./admin/AdminProtectedRoute";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Categories from "./pages/Categories";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";

import Account from "./pages/account/Account";
import Profile from "./pages/account/Profile";
import EditProfile from "./pages/account/EditProfile";
import ChangePassword from "./pages/account/ChangePassword";
import Orders from "./pages/account/Orders";
import OrderDetails from "./pages/account/OrderDetails";
import Addresses from "./pages/account/Addresses";

import AdminDashboard from "./admin/Dashboard";
import AdminProducts from "./admin/Products";
import AdminAddProduct from "./admin/AddProduct";
import AdminEditProduct from "./admin/EditProduct";
import AdminOrders from "./admin/Orders";
import AdminOrderDetails from "./admin/OrderDetails";
import AdminUsers from "./admin/Users";
import AdminCategories from "./admin/Categories";
import AdminSettings from "./admin/Settings";
import Newsletter from "./admin/Newsletter";

export default function App() {
  return (
    <Routes>

      {/* =====================================
          CUSTOMER WEBSITE
      ===================================== */}

      <Route element={<MainLayout />}>

        {/* HOME */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* SHOP */}
        <Route
          path="/shop"
          element={<Shop />}
        />

        {/* PRODUCT DETAILS */}
        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        {/* CATEGORIES */}
        <Route
          path="/categories"
          element={<Categories />}
        />

        {/* WISHLIST */}
        <Route
          path="/wishlist"
          element={<Wishlist />}
        />

        {/* CART */}
        <Route
          path="/cart"
          element={<Cart />}
        />

        {/* CHECKOUT */}
        <Route
          path="/checkout"
          element={<Checkout />}
        />

        {/* ORDER SUCCESS */}
        <Route
          path="/order-success"
          element={<OrderSuccess />}
        />

        {/* =====================================
            AUTHENTICATION
        ===================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/verify-email"
          element={<VerifyEmail />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* =====================================
            OTHER PAGES
        ===================================== */}

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        <Route
          path="/faq"
          element={<FAQ />}
        />

        {/* =====================================
            CUSTOMER ACCOUNT
        ===================================== */}

        <Route
          path="/account"
          element={<AccountLayout />}
        >
          <Route
            index
            element={<Account />}
          />

          <Route
            path="profile"
            element={<Profile />}
          />

          <Route
            path="profile/edit"
            element={<EditProfile />}
          />

          <Route
            path="orders"
            element={<Orders />}
          />

          <Route
            path="orders/:id"
            element={<OrderDetails />}
          />

          <Route
            path="addresses"
            element={<Addresses />}
          />

          <Route
            path="change-password"
            element={<ChangePassword />}
          />
        </Route>

        {/* =====================================
            404
        ===================================== */}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Route>


      {/* =====================================
          ADMIN PANEL
          
          IMPORTANT:
          AdminProtectedRoute protects
          ALL admin pages.
      ===================================== */}

      <Route element={<AdminProtectedRoute />}>

        <Route
          path="/admin"
          element={<AdminLayout />}
        >

          {/* ADMIN DASHBOARD */}
          <Route
            index
            element={<AdminDashboard />}
          />

          {/* PRODUCTS */}
          <Route
            path="products"
            element={<AdminProducts />}
          />
          

          {/* ADD PRODUCT */}
          <Route
            path="products/add"
            element={<AdminAddProduct />}
          />
          <Route path="/admin/newsletter" element={<Newsletter />} />

          {/* EDIT PRODUCT */}
          <Route
            path="products/edit/:id"
            element={<AdminEditProduct />}
          />

          {/* ORDERS */}
          <Route
            path="orders"
            element={<AdminOrders />}
          />

          {/* ORDER DETAILS */}
          <Route
            path="orders/:id"
            element={<AdminOrderDetails />}
          />

          {/* USERS */}
          <Route
            path="users"
            element={<AdminUsers />}
          />

          {/* CATEGORIES */}
          <Route
            path="categories"
            element={<AdminCategories />}
          />

          {/* SETTINGS */}
          <Route
            path="settings"
            element={<AdminSettings />}
          />

        </Route>

      </Route>

    </Routes>
  );
}