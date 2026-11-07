
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import {
  categories,
  products as localProducts,
} from "../data/products";

export default function Shop() {
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState(localProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [category, setCategory] = useState(
    searchParams.get("category") || "All"
  );

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");

  const { addToCart } = useCart();

  // Keep category in sync with URL
  useEffect(() => {
    setCategory(searchParams.get("category") || "All");
  }, [searchParams]);

  // Load local products + Firebase products
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const productMap = new Map();

        // First load local products
        localProducts.forEach((product) => {
          const key = `${String(product.category || "").toLowerCase()}_${String(product.name || "").toLowerCase()}`;
          productMap.set(key, product);
        });

        // Then add or update Firebase products
        snapshot.docs.forEach((item) => {
          const data = item.data();

          const product = {
            ...data,
            id: item.id,
          };

          const key = `${String(product.category || "").toLowerCase()}_${String(product.name || "").toLowerCase()}`;

          productMap.set(key, product);
        });

        setProducts(Array.from(productMap.values()));
        setError("");
        setLoading(false);
      },
      (err) => {
        console.error("Firebase Product Error:", err);

        // Keep local products visible if Firebase fails
        setProducts(localProducts);
        setError(
          "Firebase sync unavailable. Showing available local products."
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Categories
  const categoryNames = [
    "All",
    ...new Set([
      ...categories.map((item) => item.name),
      ...products.map((item) => item.category).filter(Boolean),
    ]),
  ];

  // Filter products
  let filteredProducts = products.filter((product) => {
    const matchesCategory =
      category === "All" || product.category === category;

    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      (product.name || "").toLowerCase().includes(searchText) ||
      (product.category || "").toLowerCase().includes(searchText) ||
      (product.description || "").toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });

  // Sorting
  if (sort === "low") {
    filteredProducts.sort(
      (a, b) => Number(a.price) - Number(b.price)
    );
  }

  if (sort === "high") {
    filteredProducts.sort(
      (a, b) => Number(b.price) - Number(a.price)
    );
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">

      {/* HERO */}
      <section className="px-5 py-16 md:py-24 text-center border-b border-[#b8964b]/20">

        <p className="text-[#c9a45c] tracking-[5px] text-xs mb-4">
          DISCOVER EXCELLENCE
        </p>

        <h1 className="text-4xl md:text-6xl font-serif mb-5">
          Our <span className="text-[#c9a45c]">Collection</span>
        </h1>

        <p className="text-gray-400 max-w-xl mx-auto">
          Explore our exclusive collection of premium products,
          carefully selected for your lifestyle.
        </p>

      </section>

      {/* SHOP */}
      <section className="max-w-7xl mx-auto px-5 py-14">

        <div className="flex flex-col md:flex-row justify-between gap-5 mb-10">

          <div>
            <p className="text-[#c9a45c] text-xs tracking-widest mb-2">
              ZENVORA STORE
            </p>

            <h2 className="text-3xl font-serif">
              Shop All Products
            </h2>

            <p className="text-gray-400 text-sm mt-2">
              Showing {filteredProducts.length} products
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#171717] border border-[#b8964b]/30 rounded-lg px-4 py-3 outline-none focus:border-[#c9a45c]"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-[#c9a45c] text-sm"
              >
                Clear Search ✕
              </button>
            )}

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-[#171717] border border-[#b8964b]/30 rounded-lg px-4 py-3 outline-none"
            >
              <option value="default">Default Sorting</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>

          </div>
        </div>

        {/* CATEGORY FILTER */}
        <div className="flex gap-3 overflow-x-auto pb-5 mb-8">

          {categoryNames.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`px-5 py-2.5 rounded-full whitespace-nowrap border transition ${
                category === item
                  ? "bg-[#c9a45c] text-black border-[#c9a45c]"
                  : "border-[#b8964b]/30 text-gray-300 hover:border-[#c9a45c]"
              }`}
            >
              {item}
            </button>
          ))}

        </div>

        {/* LOADING */}
        {loading && (
          <p className="text-center py-10 text-[#c9a45c]">
            Syncing Products...
          </p>
        )}

        {/* FIREBASE WARNING */}
        {error && (
          <p className="text-center text-yellow-400 text-sm mb-6">
            {error}
          </p>
        )}

        {/* PRODUCTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          {filteredProducts.map((product) => (
            <ProductCard
              key={`${product.category}-${product.name}`}
              product={product}
              onAdd={addToCart}
            />
          ))}

        </div>

        {/* EMPTY STATE */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20">

            <h3 className="text-2xl font-serif text-[#c9a45c]">
              No Products Found
            </h3>

            <p className="text-gray-400 mt-3">
              Try another search or category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All");
                setSort("default");
              }}
              className="mt-5 bg-[#c9a45c] text-black px-6 py-3 rounded-lg"
            >
              Show All Products
            </button>

          </div>
        )}

      </section>
    </main>
  );
}
