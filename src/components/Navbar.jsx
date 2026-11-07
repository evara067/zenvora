import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import {
  ShoppingBag,
  Search,
  Menu,
  X,
  UserRound,
  LogOut,
  ChevronRight
} from "lucide-react";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/config.js";

import { products } from "../data/products";
import ProductCard from "./ProductCard";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleEscape = event => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setSearchTerm("");
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const closeMenu = () => {
    setOpen(false);
    setAccountOpen(false);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchTerm("");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      closeMenu();
      navigate("/");
      alert("Logout Successful!");
    } catch (error) {
      alert(error.message);
    }
  };

  const searchResults = searchTerm.trim()
    ? products.filter(product => {
        const term = searchTerm.trim().toLowerCase();

        return (
          product.name?.toLowerCase().includes(term) ||
          product.category?.toLowerCase().includes(term) ||
          product.description?.toLowerCase().includes(term)
        );
      })
    : [];

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Categories", path: "/shop" }
  ];

  const navClass = ({ isActive }) =>
    `relative py-2 text-[13px] tracking-wide font-medium transition-colors duration-300 ${
      isActive
        ? "text-[#A98755]"
        : "text-[#51483D] hover:text-[#B18B51]"
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#FDFCF9]/95 backdrop-blur-md border-b border-[#EAE3D8]">
        <nav className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 h-[76px] flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" onClick={closeMenu} className="group flex flex-col">
            <span className="text-[30px] md:text-[34px] font-serif font-semibold tracking-[-1.5px] text-[#302820] leading-none">
              zenvora<span className="text-[#B18B51]">.</span>
            </span>

            <span className="text-[8px] tracking-[4px] text-[#A18B6C] uppercase mt-1.5">
              Beyond Ordinary
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-9 lg:gap-11">
            {navLinks.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                end={item.path === "/"}
                className={navClass}
              >
                {({ isActive }) => (
                  <span className="relative">
                    {item.name}
                    <span
                      className={`absolute left-0 -bottom-2 h-[1px] bg-[#B18B51] transition-all duration-300 ${
                        isActive ? "w-full" : "w-0"
                      }`}
                    />
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-3 sm:gap-5">

            {/* SEARCH */}
            <button
              type="button"
              onClick={() => {
                setSearchOpen(true);
                closeMenu();
              }}
              aria-label="Search products"
              title="Search Products"
              className="text-[#51483D] hover:text-[#B18B51] transition"
            >
              <Search size={21} strokeWidth={1.6} />
            </button>

            {/* ACCOUNT */}
            {!loading && (
              user ? (
                <Link
                  to="/profile"
                  title="My Account"
                  className="hidden sm:flex items-center gap-2 text-[#51483D] hover:text-[#B18B51] transition"
                >
                  <UserRound size={20} strokeWidth={1.6} />
                  <span className="text-xs font-medium">Account</span>
                </Link>
              ) : (
                <div className="relative hidden sm:block">
                  <button
                    type="button"
                    onClick={() => setAccountOpen(!accountOpen)}
                    title="Account"
                    aria-expanded={accountOpen}
                    className="flex items-center gap-2 text-[#51483D] hover:text-[#B18B51] transition"
                  >
                    <UserRound size={21} strokeWidth={1.6} />
                    <span className="text-xs font-medium">Account</span>
                  </button>

                  {accountOpen && (
                    <div className="absolute right-0 top-12 w-52 bg-white border border-[#EAE3D8] shadow-xl rounded-lg p-2">
                      <Link
                        to="/login"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-[#51483D] hover:bg-[#F8F5EF] rounded-md transition"
                      >
                        <UserRound size={17} />
                        Login
                      </Link>

                      <Link
                        to="/register"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-[#A98755] hover:bg-[#F8F5EF] rounded-md transition"
                      >
                        <UserRound size={17} />
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              )
            )}

            {/* CART */}
            <Link
              to="/cart"
              aria-label="Shopping Cart"
              title="My Cart"
              className="relative text-[#302820] hover:text-[#B18B51] transition"
            >
              <ShoppingBag size={22} strokeWidth={1.6} />
            </Link>

            {/* LOGOUT */}
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                className="hidden lg:flex items-center gap-1.5 text-xs text-[#796B5B] hover:text-red-600 transition"
              >
                <LogOut size={17} />
                Logout
              </button>
            )}

            {/* MOBILE MENU */}
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="md:hidden ml-1 text-[#302820] hover:text-[#B18B51] transition"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? (
                <X size={25} strokeWidth={1.6} />
              ) : (
                <Menu size={25} strokeWidth={1.6} />
              )}
            </button>
          </div>
        </nav>

        {/* MOBILE NAVIGATION */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            open
              ? "max-h-[600px] opacity-100 border-t border-[#EAE3D8]"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-[#FDFCF9] px-6 py-5">
            <p className="text-[10px] tracking-[3px] uppercase text-[#B18B51] mb-4">
              Explore Zenvora
            </p>

            <div className="flex flex-col">
              {navLinks.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `flex justify-between items-center py-3.5 border-b border-[#EEE8DE] text-sm transition ${
                      isActive
                        ? "text-[#A98755] font-semibold"
                        : "text-[#51483D] hover:text-[#B18B51]"
                    }`
                  }
                >
                  {item.name}
                  <ChevronRight size={16} />
                </NavLink>
              ))}

              <Link
                to="/cart"
                onClick={closeMenu}
                className="flex justify-between items-center py-3.5 border-b border-[#EEE8DE] text-sm text-[#51483D]"
              >
                My Cart
                <ShoppingBag size={17} />
              </Link>

              {!loading && (
                user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={closeMenu}
                      className="flex items-center gap-3 py-3.5 border-b border-[#EEE8DE] text-sm text-[#51483D]"
                    >
                      <UserRound size={17} />
                      My Account
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-3 py-3.5 text-sm text-red-600 text-left"
                    >
                      <LogOut size={17} />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className="flex items-center gap-3 py-3.5 border-b border-[#EEE8DE] text-sm text-[#51483D]"
                    >
                      <UserRound size={17} />
                      Login
                    </Link>

                    <Link
                      to="/register"
                      onClick={closeMenu}
                      className="flex items-center gap-3 py-3.5 text-sm text-[#A98755] font-medium"
                    >
                      <UserRound size={17} />
                      Create Account
                    </Link>
                  </>
                )
              )}
            </div>

            <p className="text-center text-[9px] tracking-[3px] uppercase text-[#A18B6C] mt-5">
              Zenvora — Beyond Ordinary
            </p>
          </div>
        </div>
      </header>

      {/* LUXURY SEARCH PANEL */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] bg-[#17130F]/70 backdrop-blur-sm px-3 sm:px-5 pt-20 md:pt-28 pb-6 overflow-y-auto"
          onClick={closeSearch}
        >
          <div
            className="bg-[#F8F6F1] w-full max-w-5xl mx-auto rounded-2xl shadow-2xl overflow-hidden border border-[#D5BB91]/40"
            onClick={e => e.stopPropagation()}
          >
            {/* PANEL HEADER */}
            <div className="flex items-center justify-between px-5 md:px-8 py-5 border-b border-[#DED4C4]">
              <div>
                <p className="text-[#AE8953] uppercase tracking-[3px] text-[10px] font-semibold">
                  Zenvora Collection
                </p>

                <h2 className="font-serif text-2xl md:text-3xl text-[#302820] mt-1">
                  Find Your Favorites
                </h2>
              </div>

              {/* ONLY PANEL CLOSE BUTTON */}
              <button
                type="button"
                onClick={closeSearch}
                aria-label="Close search"
                className="w-10 h-10 rounded-full border border-[#B99A6A] flex items-center justify-center text-[#302820] hover:bg-[#302820] hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* SEARCH INPUT */}
            <div className="p-5 md:p-8">
              <div className="flex items-center gap-3 bg-white border border-[#C6AD87] rounded-xl px-4 py-4 focus-within:ring-2 focus-within:ring-[#B39362] transition">
                <Search size={22} className="text-[#AE8953] shrink-0" />

                <input
                  type="text"
                  autoFocus
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search any product or category..."
                  className="w-full bg-transparent outline-none text-sm text-[#302820]"
                />

                {/* CUSTOM CLEAR BUTTON */}
                {searchTerm.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                    title="Clear search"
                    className="shrink-0 text-[#8B8174] hover:text-[#302820] transition"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* SEARCH RESULTS */}
              <div className="mt-7">
                {!searchTerm.trim() && (
                  <div className="text-center py-12">
                    <Search
                      size={42}
                      className="mx-auto text-[#B99A6A] mb-4"
                    />

                    <h3 className="font-serif text-xl md:text-2xl">
                      What are you looking for?
                    </h3>

                    <p className="text-sm text-[#8B8174] mt-2">
                      Search products from all Zenvora categories.
                    </p>
                  </div>
                )}

                {searchTerm.trim() && searchResults.length > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-serif text-xl">
                        Search Results
                      </h3>

                      <span className="text-xs text-[#AE8953]">
                        {searchResults.length} products found
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-h-[55vh] overflow-y-auto pr-1 pb-3">
                      {searchResults.map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onAdd={addToCart}
                        />
                      ))}
                    </div>
                  </>
                )}

                {searchTerm.trim() && searchResults.length === 0 && (
                  <div className="text-center py-12">
                    <Search
                      size={42}
                      className="mx-auto text-[#B99A6A] mb-4"
                    />

                    <h3 className="font-serif text-xl">
                      No Products Found
                    </h3>

                    <p className="text-sm text-[#8B8174] mt-2">
                      Try another product name or category.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}