
import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

import { Search, X, ArrowRight } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { categories, products as localProducts } from "../data/products";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState(localProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");

  const category = searchParams.get("category") || "All";
  const categoryView = searchParams.get("view") === "categories";

  // Firebase product sync
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      snapshot => {
        const productMap = new Map();

        localProducts.forEach(product => {
          const key = `${String(product.category || "").toLowerCase()}_${String(product.name || "").toLowerCase()}`;
          productMap.set(key, product);
        });

        snapshot.docs.forEach(item => {
          const product = {
            ...item.data(),
            id: item.id
          };

          const key = `${String(product.category || "").toLowerCase()}_${String(product.name || "").toLowerCase()}`;
          productMap.set(key, product);
        });

        setProducts(Array.from(productMap.values()));
        setError("");
        setLoading(false);
      },
      err => {
        console.error("Firebase Product Error:", err);
        setProducts(localProducts);
        setError("Firebase sync unavailable. Showing local products.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const categoryNames = useMemo(() => [
    "All",
    ...new Set([
      ...categories.map(item => item.name),
      ...products.map(item => item.category).filter(Boolean)
    ])
  ], [products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(product => {
      const matchesCategory =
        category === "All" || product.category === category;

      const term = search.trim().toLowerCase();

      const matchesSearch = !term || [
        product.name,
        product.description
      ].some(value => String(value || "").toLowerCase().includes(term));

      return matchesCategory && matchesSearch;
    });

    if (sort === "low") {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (sort === "high") {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    return result;
  }, [products, category, search, sort]);

  const selectCategory = name => {
    const next = new URLSearchParams(searchParams);

    next.delete("view");

    if (name === "All") {
      next.delete("category");
    } else {
      next.set("category", name);
    }

    setSearchParams(next);
    setSearch("");
  };

  const showCategories = () => {
    setSearch("");
    setSort("default");
    setSearchParams({ view: "categories" });
  };

  const showAllProducts = () => {
    setSearch("");
    setSort("default");
    setSearchParams({});
  };

  return (
    <main className="min-h-screen bg-[#F8F6F1] text-[#302820]">

      {/* HERO */}
      <section className="px-5 py-16 md:py-24 text-center border-b border-[#B99A6A]/20">
        <p className="text-[#946D3D] tracking-[5px] text-xs mb-4">
          DISCOVER EXCELLENCE
        </p>

        <h1 className="text-4xl md:text-6xl font-serif mb-5">
          Our <span className="text-[#A98755]">Collection</span>
        </h1>

        <p className="text-[#766B5E] max-w-xl mx-auto">
          Explore our exclusive collection of premium products,
          carefully selected for your lifestyle.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-5 py-14">

        {/* PAGE NAVIGATION */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <button
            type="button"
            onClick={showAllProducts}
            className={`px-5 py-3 rounded-lg text-sm font-semibold transition ${
              !categoryView
                ? "bg-[#302820] text-white"
                : "bg-white text-[#302820] border border-[#D8C8AD]"
            }`}
          >
            All Products
          </button>

          <button
            type="button"
            onClick={showCategories}
            className={`px-5 py-3 rounded-lg text-sm font-semibold transition ${
              categoryView
                ? "bg-[#302820] text-white"
                : "bg-white text-[#302820] border border-[#D8C8AD]"
            }`}
          >
            Browse Categories
          </button>
        </div>

        {/* CATEGORY VIEW */}
        {categoryView ? (
          <>
            <div className="mb-9">
              <p className="text-[#946D3D] text-xs tracking-widest mb-2">
                EXPLORE ZENVORA
              </p>
              <h2 className="text-3xl md:text-4xl font-serif">
                Choose Your Category
              </h2>
              <p className="text-[#766B5E] text-sm mt-3">
                Select a category to explore its products.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {categories.map(item => (
                <Link
                  key={item.name}
                  to={`/shop?category=${encodeURIComponent(item.name)}`}
                  className="group relative overflow-hidden rounded-xl aspect-[4/5] bg-[#EDE6DA]"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#211B15]/85 to-transparent" />

                  <div className="absolute bottom-0 p-5 text-white">
                    <h3 className="font-serif text-xl md:text-2xl">
                      {item.name}
                    </h3>
                    <p className="text-white/90 text-xs mt-2">
                      {item.subtitle}
                    </p>
                    <span className="flex items-center gap-2 mt-4 text-[#F0D5A8] text-sm">
                      Explore <ArrowRight size={15} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* SHOP HEADER */}
            <div className="flex flex-col md:flex-row justify-between gap-5 mb-10">
              <div>
                <p className="text-[#946D3D] text-xs tracking-widest mb-2">
                  ZENVORA STORE
                </p>

                <h2 className="text-3xl font-serif">
                  {category === "All" ? "Shop All Products" : category}
                </h2>

                <p className="text-[#766B5E] text-sm mt-2">
                  Showing {filteredProducts.length} products
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 bg-white border border-[#D8C8AD] rounded-lg px-4">
                  <Search size={18} className="text-[#946D3D]" />
                  <input
                    type="search"
                    placeholder="Search products..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-transparent text-[#302820] placeholder:text-gray-500 outline-none py-3 min-w-0 w-full"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                      className="text-[#302820] hover:text-red-600"
                    >
                      <X size={17} />
                    </button>
                  )}
                </div>

                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="bg-white text-[#302820] border border-[#D8C8AD] rounded-lg px-4 py-3 outline-none"
                >
                  <option value="default">Default Sorting</option>
                  <option value="low">Price: Low to High</option>
                  <option value="high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* CATEGORY FILTER */}
            <div className="mb-9">
              <p className="text-xs uppercase tracking-widest text-[#946D3D] mb-4">
                Filter by Category
              </p>

              <div className="flex gap-3 overflow-x-auto pb-4">
                {categoryNames.map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => selectCategory(item)}
                    className={`px-5 py-3 rounded-full whitespace-nowrap border text-sm font-semibold transition ${
                      category === item
                        ? "bg-[#302820] text-white border-[#302820]"
                        : "bg-white text-[#51483D] border-[#D8C8AD] hover:border-[#A98755]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* LOADING */}
            {loading && (
              <p className="text-center py-12 text-[#946D3D]">
                Loading Products...
              </p>
            )}

            {error && (
              <p className="text-center text-amber-700 text-sm mb-6">
                {error}
              </p>
            )}

            {/* PRODUCT GRID */}
            {!loading && filteredProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            )}

            {/* EMPTY STATE */}
            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <h3 className="text-2xl font-serif text-[#946D3D]">
                  No Products Found
                </h3>

                <p className="text-[#766B5E] mt-3">
                  Try another search or category.
                </p>

                <button
                  type="button"
                  onClick={showAllProducts}
                  className="mt-5 bg-[#302820] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#A98755] hover:text-[#211B15] transition"
                >
                  Show All Products
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
