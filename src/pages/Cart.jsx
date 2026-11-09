
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { Trash2 } from "lucide-react";

export default function Cart() {
  const {
    cart,
    total,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const handleCheckout = () => {
    if (!authReady) return;

    if (!user) {
      clearCart();
      navigate("/login");
      return;
    }

    navigate("/checkout");
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-32 px-5">
        <h1 className="text-3xl font-black">
          Your Cart is Empty 🛒
        </h1>

        <Link
          to="/shop"
          className="inline-block mt-6 bg-purple-600 text-white px-7 py-3 rounded-xl"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-5 py-12">

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">
          Shopping Cart
        </h1>

        <button
          onClick={clearCart}
          className="text-red-500 font-semibold hover:text-red-700"
        >
          Clear Cart
        </button>
      </div>

      <div className="space-y-4">
        {cart.map((item) => (
          <div
            key={item.id}
            className="bg-white p-5 rounded-2xl flex items-center gap-4 shadow-sm"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 object-contain bg-purple-50 rounded-xl"
            />

            <div className="flex-1">
              <h3 className="font-bold">
                {item.name}
              </h3>

              <p>৳{item.price}</p>

              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() =>
                    updateQuantity(item.id, item.quantity - 1)
                  }
                >
                  −
                </button>

                <span>{item.quantity}</span>

                <button
                  onClick={() =>
                    updateQuantity(item.id, item.quantity + 1)
                  }
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={() => removeFromCart(item.id)}
            >
              <Trash2 color="red" />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl mt-8">
        <h2 className="text-xl font-bold">
          Total: ৳{total.toLocaleString("en-BD")}
        </h2>

        <button
          onClick={handleCheckout}
          disabled={!authReady}
          className="block text-center w-full mt-5 bg-purple-600 text-white p-4 rounded-xl font-bold hover:bg-purple-700 transition disabled:opacity-50"
        >
          Proceed to Checkout
        </button>
      </div>

    </div>
  );
}
