
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  if (!product) return null;

  const openProduct = () => {
    navigate(`/product/${product.id}`, {
      state: { product },
    });
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white border border-[#eee7df] hover:shadow-xl transition-all duration-300">

      {/* Product Image */}
      <div
        onClick={openProduct}
        className="relative aspect-[4/5] overflow-hidden bg-[#f8f5f1] cursor-pointer"
      >
        <img
          src={product.image || product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Featured Badge */}
        {product.featured && (
          <span className="absolute top-3 left-3 bg-[#302820] text-white text-xs px-3 py-1 rounded-full">
            Featured
          </span>
        )}

        {/* View Product Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openProduct();
          }}
          aria-label="View product"
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white text-[#302820] flex items-center justify-center shadow-md hover:bg-[#302820] hover:text-white transition"
        >
          <ArrowUpRight size={20} />
        </button>
      </div>

      {/* Product Information */}
      <div className="p-4">

        <p className="text-xs uppercase tracking-wider text-gray-500">
          {product.category || "Collection"}
        </p>

        <button
          type="button"
          onClick={openProduct}
          className="block text-left w-full mt-2 font-serif text-lg text-[#302820] hover:text-[#b47b52] transition"
        >
          {product.name}
        </button>

        <div className="flex items-center justify-between gap-2 mt-4">

          <p className="text-lg font-semibold text-[#302820]">
            ৳{Number(product.price || 0).toLocaleString("en-BD")}
          </p>

          <button
            type="button"
            onClick={handleAddToCart}
            className="flex items-center gap-2 rounded-full bg-[#302820] text-white px-4 py-2 text-sm hover:bg-[#b47b52] transition"
          >
            <ShoppingBag size={16} />
            Add
          </button>

        </div>
      </div>
    </div>
  );
}
