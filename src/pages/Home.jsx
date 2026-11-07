
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { categories } from "../data/products";

function ProductSection({ title, subtitle, items, onAdd }) {
  return (
    <section className="py-16 md:py-20">
      <div className="flex items-end justify-between gap-4 mb-9">
        <div>
          <p className="text-[#AE8953] uppercase tracking-[3px] text-xs font-semibold">
            {subtitle}
          </p>
          <h2 className="text-3xl md:text-4xl font-serif text-[#302820] mt-3">
            {title}
          </h2>
        </div>

        <Link to="/shop" className="text-sm border-b border-[#B99A6A] pb-1">
          View All →
        </Link>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={onAdd}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10">
          No products available yet.
        </p>
      )}
    </section>
  );
}

export default function Home() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productError, setProductError] = useState("");

  // Firebase Live Product Sync
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const productList = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setProducts(productList);
        setProductError("");
        setLoading(false);
      },
      (error) => {
        console.error("Home Product Error:", error);
        setProductError("Unable to load products. Please try again.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Featured Products
  const featuredProducts = products.some((p) => p.featured)
    ? products.filter((p) => p.featured).slice(0, 4)
    : products.slice(0, 4);

  // New Arrivals
  const newArrivals = products.some((p) => p.newArrival)
    ? products.filter((p) => p.newArrival).slice(0, 4)
    : [...products]
        .sort((a, b) =>
          String(b.createdAt || b.updatedAt || "").localeCompare(
            String(a.createdAt || a.updatedAt || "")
          )
        )
        .slice(0, 4);

  // Best Sellers
  const bestSellers = products.some((p) => p.bestSeller)
    ? products.filter((p) => p.bestSeller).slice(0, 4)
    : products.slice(0, 4);

  return (
    <main className="bg-[#F8F6F1] min-h-screen text-[#302820] overflow-hidden">

      {/* HERO */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-6">
        <div className="relative min-h-[510px] md:min-h-[600px] rounded-[24px] overflow-hidden">

          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1800"
            alt="Zenvora Shopping"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#211B15]/90 via-[#211B15]/55 to-transparent" />

          <div className="relative z-10 min-h-[510px] md:min-h-[600px] flex items-center px-7 md:px-16 lg:px-20 py-16">
            <div className="max-w-2xl text-white w-full">

              <p className="text-[#E8D2AE] tracking-[4px] text-xs uppercase mb-7">
                Discover the extraordinary
              </p>

              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[82px] leading-tight">
                A World of
                <span className="block italic text-[#E4C99E]">
                  Timeless Elegance.
                </span>
              </h1>

              <p className="text-white/80 text-sm md:text-base leading-7 max-w-lg mt-7">
                Thoughtfully selected essentials, modern technology and
                timeless style. Discover a shopping experience that feels
                exceptional.
              </p>

              <Link
                to="/shop"
                className="inline-block mt-9 bg-[#D5BB91] text-[#302820] px-8 py-4 text-sm font-semibold hover:bg-white transition"
              >
                Explore Collection →
              </Link>

              <p className="text-white/70 text-xs tracking-[3px] uppercase mt-12">
                Zenvora — Beyond Ordinary
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            ["✧", "Premium Selection", "Carefully selected products"],
            ["◇", "Secure Shopping", "Shop with confidence"],
            ["♧", "Reliable Delivery", "Convenience at your door"],
            ["☆", "Customer Care", "Here whenever you need us"]
          ].map(([icon, title, desc]) => (
            <div key={title} className="flex gap-3">
              <span className="text-3xl text-[#B39362]">{icon}</span>
              <div>
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="text-xs text-[#8B8174] mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-16">
        <div className="text-center mb-12">
          <p className="text-[#AE8953] uppercase tracking-[4px] text-xs">
            Explore our world
          </p>
          <h2 className="text-3xl md:text-5xl font-serif mt-4">
            Shop by Category
          </h2>
          <p className="text-[#8B8174] text-sm mt-4">
            Find something special for every part of your life.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/shop?category=${encodeURIComponent(category.name)}`}
              className="group relative overflow-hidden aspect-[4/5] bg-[#EDE6DA]"
            >
              <img
                src={category.image}
                alt={category.name}
                loading="lazy"
                className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#211B15]/80 via-transparent to-transparent" />

              <div className="absolute bottom-0 left-0 p-4 md:p-6 text-white">
                <h3 className="font-serif text-lg md:text-2xl">
                  {category.name}
                </h3>
                <p className="text-white/75 text-xs mt-2">
                  {category.subtitle}
                </p>
                <span className="inline-block mt-4 text-[#E8D2AE] text-xs border-b border-[#E8D2AE] pb-1">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-8">

          {loading ? (
            <p className="text-center py-16">Loading products...</p>
          ) : (
            <ProductSection
              title="Featured Collection"
              subtitle="Selected with care"
              items={featuredProducts}
              onAdd={addToCart}
            />
          )}

        </div>
      </div>

      {/* PROMOTION */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 bg-[#EDE6DA] overflow-hidden">
          <div className="min-h-[320px] md:min-h-[440px]">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000"
              alt="Lifestyle Collection"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-center px-7 py-12 md:px-14">
            <p className="text-[#AE8953] uppercase tracking-[3px] text-xs">
              The Zenvora experience
            </p>

            <h2 className="font-serif text-4xl md:text-5xl mt-5">
              Thoughtful Choices.
              <span className="block italic text-[#A98755]">
                Exceptional Living.
              </span>
            </h2>

            <p className="text-[#766B5E] text-sm leading-7 mt-6">
              Discover a collection where quality meets contemporary style.
              From everyday essentials to your next favorite find.
            </p>

            <Link
              to="/shop"
              className="mt-8 bg-[#302820] text-white px-8 py-4 text-sm font-semibold w-fit hover:bg-[#A98755] transition"
            >
              Shop the Collection →
            </Link>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <div className="bg-[#F0ECE4]">
        <div className="max-w-7xl mx-auto px-5 md:px-8">

          {loading ? (
            <p className="text-center py-16">Loading products...</p>
          ) : (
            <ProductSection
              title="New Arrivals"
              subtitle="Freshly discovered"
              items={newArrivals}
              onAdd={addToCart}
            />
          )}

        </div>
      </div>

      {/* BRAND STATEMENT */}
      <section className="bg-[#302820] text-center px-6 py-20">
        <p className="text-[#D5BB91] text-xs tracking-[5px] uppercase">
          More than just shopping
        </p>

        <h2 className="font-serif text-4xl md:text-6xl text-[#F8F6F1] mt-5">
          Discover Your <span className="italic text-[#D5BB91]">Zenvora.</span>
        </h2>

        <p className="text-white/60 text-sm max-w-lg mx-auto mt-5 leading-7">
          A thoughtful destination for modern essentials, timeless style
          and everything in between.
        </p>

        <Link
          to="/shop"
          className="inline-block mt-9 border border-[#D5BB91] text-[#E8D2AE] px-9 py-4 text-sm hover:bg-[#D5BB91] hover:text-[#302820] transition"
        >
          Explore All Products →
        </Link>
      </section>

      {/* BEST SELLERS */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 pb-10">

        {loading ? (
          <p className="text-center py-16">Loading products...</p>
        ) : (
          <ProductSection
            title="Our Best Picks"
            subtitle="Worth discovering"
            items={bestSellers}
            onAdd={addToCart}
          />
        )}

      </div>

      {productError && (
        <p className="text-center text-red-600 py-5">
          {productError}
        </p>
      )}

    </main>
  );
}
