
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function Checkout() {
  const { cart, total, clearCart } = useCart();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0 || loading) return;

    setLoading(true);

    try {
      const orderData = {
        customer: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
        },

        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          image: item.image || "",
        })),

        total: Number(total),
        status: "Pending",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, "orders"),
        orderData
      );

      setOrderId(docRef.id);

      clearCart();

      setSuccess(true);

    } catch (error) {
      console.error("Order Error:", error);

      alert("Order failed: " + error.message);

    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-32 px-5">

        <div className="text-6xl mb-5">🎉</div>

        <h1 className="text-3xl font-black text-green-600">
          Order Placed Successfully!
        </h1>

        <p className="mt-4 text-gray-600">
          Thank you for shopping with Zenvora.
        </p>

        <p className="mt-3 font-semibold break-all">
          Order ID: {orderId}
        </p>

        <Link
          to="/shop"
          className="inline-block mt-7 bg-[#20204A] text-white px-8 py-3 rounded-xl"
        >
          Continue Shopping
        </Link>

      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-32">

        <h1 className="text-3xl font-bold">
          Your Cart is Empty 🛒
        </h1>

        <Link
          to="/shop"
          className="inline-block mt-6 bg-purple-600 text-white px-7 py-3 rounded-xl"
        >
          Go Shopping
        </Link>

      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">

      <h1 className="text-3xl font-black mb-8">
        Checkout
      </h1>

      <div className="grid md:grid-cols-2 gap-10">

        <form
          onSubmit={handleSubmit}
          className="bg-white p-7 rounded-2xl shadow-sm"
        >

          <h2 className="text-xl font-bold mb-6">
            Customer Information
          </h2>

          <div className="space-y-5">

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border p-4 rounded-xl"
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border p-4 rounded-xl"
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full border p-4 rounded-xl"
            />

            <textarea
              name="address"
              placeholder="Full Delivery Address"
              value={formData.address}
              onChange={handleChange}
              required
              rows="4"
              className="w-full border p-4 rounded-xl"
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-7 bg-[#20204A] text-white p-4 rounded-xl font-bold hover:bg-purple-700 transition disabled:opacity-60"
          >
            {loading ? "Processing Order..." : "Place Order"}
          </button>

        </form>

        <div className="bg-gray-50 p-7 rounded-2xl h-fit">

          <h2 className="text-xl font-bold mb-6">
            Order Summary
          </h2>

          {cart.map((item) => (

            <div
              key={item.id}
              className="flex justify-between gap-4 mb-4"
            >

              <span>
                {item.name} × {item.quantity}
              </span>

              <span className="font-semibold">
                ৳{(
                  Number(item.price) *
                  Number(item.quantity)
                ).toLocaleString("en-BD")}
              </span>

            </div>

          ))}

          <div className="border-t pt-5 mt-5">

            <div className="flex justify-between text-xl font-black">
              <span>Total</span>

              <span>
                ৳{Number(total).toLocaleString("en-BD")}
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
