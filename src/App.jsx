
import { useLayoutEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";
import ProductDetails from "./pages/ProductDetails";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./Profile";

import { CartProvider } from "./context/CartContext";


function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

  }, [pathname]);

  return null;
}


function NotFound() {
  return (
    <div className="text-center py-32 bg-[#F8F6F1] text-[#302820] min-h-screen">
      <h1 className="text-5xl font-black text-[#A98755]">
        404
      </h1>
      <p className="mt-3 text-gray-600">
        Page not found
      </p>
    </div>
  );
}


function AppContent() {
  const location = useLocation();

  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      <ScrollToTop />

      {!isAdmin && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/shop" element={<Shop />} />

        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        <Route path="/cart" element={<Cart />} />

        <Route path="/checkout" element={<Checkout />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/admin" element={<Admin />} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      {!isAdmin && <Footer />}
    </>
  );
}


export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}
