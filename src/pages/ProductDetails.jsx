import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { ShoppingCart, ArrowLeft, Minus, Plus } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function ProductDetails() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const product = state?.product
  const [quantity, setQuantity] = useState(1)

  if (!product) {
    return (
      <div className="min-h-screen bg-[#090909] text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl text-[#c9a45c] mb-4">
          Product Not Found
        </h2>
        <Link to="/shop" className="underline">
          Back to Shop
        </Link>
      </div>
    )
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    navigate('/cart')
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white px-5 py-12">

      <div className="max-w-6xl mx-auto">

        <Link to="/shop" className="flex items-center gap-2 text-[#c9a45c] mb-10">
          <ArrowLeft size={18} />
          Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-12 items-center">

          <div className="bg-[#171717] rounded-2xl p-8 border border-[#c9a45c]/20">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-80 object-contain"
            />
          </div>

          <div>
            <p className="text-[#c9a45c] tracking-widest uppercase text-sm">
              {product.category}
            </p>

            <h1 className="text-4xl md:text-5xl font-serif mt-4">
              {product.name}
            </h1>

            <p className="text-3xl text-[#c9a45c] font-semibold mt-6">
              ৳{Number(product.price).toLocaleString('en-BD')}
            </p>

            <p className="text-gray-400 leading-7 mt-6">
              {product.description || `Discover the quality and elegance of ${product.name} with Zenvora's premium collection.`}
            </p>

            <div className="flex items-center gap-5 mt-9">
              <span className="text-gray-300">Quantity:</span>

              <div className="flex items-center border border-[#c9a45c]/40 rounded-lg">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-3 hover:text-[#c9a45c]"
                >
                  <Minus size={16} />
                </button>

                <span className="px-4">{quantity}</span>

                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="p-3 hover:text-[#c9a45c]"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="mt-9 w-full bg-[#c9a45c] text-black py-4 rounded-lg font-semibold flex items-center justify-center gap-3 hover:bg-[#e0bd77] transition"
            >
              <ShoppingCart size={19} />
              Add to Cart
            </button>

          </div>
        </div>
      </div>
    </main>
  )
}