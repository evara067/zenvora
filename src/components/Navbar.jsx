
import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";

import {
  ShoppingBag,
  Search,
  Menu,
  X,
  UserRound,
  LogOut,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from "lucide-react";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase/config";

import {
  collection,
  onSnapshot
} from "firebase/firestore";

import ProductCard from "./ProductCard";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(true);

  const [toast, setToast] = useState(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Firebase Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Live Firebase Products
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      snapshot => {
        setProducts(
          snapshot.docs.map(item => ({
            id: item.id,
            ...item.data()
          }))
        );
        setProductLoading(false);
      },
      error => {
        console.error("Product loading error:", error);
        setProductLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Toast auto close
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast]);

  // Close search with Escape
  useEffect(() => {
    const handleEscape = event => {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
    setAccountOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const closeMenu = () => {
    setOpen(false);
    setAccountOpen(false);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchTerm("");
  };

  // Logout
  const handleLogout = async () => {
    if (logoutLoading) return;

    setLogoutLoading(true);

    try {
      await signOut(auth);

      closeMenu();

      navigate("/", { replace: true });

      setToast({
        type: "success",
        title: "Logged Out Successfully",
        message: "You have been safely logged out of your account."
      });
    } catch (error) {
      console.error("Logout Error:", error);

      setToast({
        type: "error",
        title: "Logout Failed",
        message: "Something went wrong. Please try again."
      });
    } finally {
      setLogoutLoading(false);
    }
  };

  // Product Search
  const searchResults = searchTerm.trim()
    ? products.filter(product => {
        const term = searchTerm.trim().toLowerCase();

        return (
          product.name?.toLowerCase().includes(term) ||
          product.description?.toLowerCase().includes(term)
        );
      })
    : [];

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Categories", path: "/shop?view=categories" }
  ];

  const isLinkActive = item => {
    if (item.name === "Home") {
      return location.pathname === "/";
    }

    if (item.name === "Categories") {
      return (
        location.pathname === "/shop" &&
        location.search.includes("view=categories")
      );
    }

    if (item.name === "Shop") {
      return (
        location.pathname === "/shop" &&
        !location.search.includes("view=categories")
      );
    }

    return false;
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#FDFCF9]/95 backdrop-blur-xl border-b border-[#EAE3D8] shadow-[0_3px_20px_rgba(48,40,32,0.04)]">

        {/* TOP NAVBAR */}
        <nav className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 h-[78px] flex items-center justify-between">

          {/* LOGO */}
          <Link
            to="/"
            onClick={closeMenu}
            className="group flex flex-col"
          >
            <span className="text-[31px] md:text-[35px] font-serif font-semibold tracking-[-1.8px] text-[#302820] leading-none">
              zenvora<span className="text-[#B18B51] group-hover:text-[#8B673C] transition">.</span>
            </span>

            <span className="text-[8px] tracking-[4.5px] text-[#A18B6C] uppercase mt-2">
              Beyond Ordinary
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-9 lg:gap-12">

            {navLinks.map(item => (
              <Link
                key={item.name}
                to={item.path}
                onClick={closeMenu}
                className={`relative py-3 text-[13px] tracking-[0.5px] font-medium transition-all duration-300 group ${
                  isLinkActive(item)
                    ? "text-[#A98755]"
                    : "text-[#51483D] hover:text-[#A98755]"
                }`}
              >
                {item.name}

                <span
                  className={`absolute left-0 -bottom-0.5 h-[2px] bg-[#B18B51] transition-all duration-300 ${
                    isLinkActive(item)
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
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
              className="w-10 h-10 flex items-center justify-center rounded-full text-[#302820] hover:bg-[#F0EADF] hover:text-[#A98755] transition-all"
            >
              <Search size={20} strokeWidth={1.8} />
            </button>

            {/* ACCOUNT */}
            {!loading && (
              user ? (
                <Link
                  to="/profile"
                  title="My Account"
                  className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full text-[#302820] hover:bg-[#F0EADF] hover:text-[#A98755] transition"
                >
                  <UserRound size={19} />
                  <span className="text-xs font-medium">My Account</span>
                </Link>
              ) : (
                <div className="relative hidden sm:block">

                  <button
                    type="button"
                    onClick={() => setAccountOpen(!accountOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full text-[#302820] hover:bg-[#F0EADF] hover:text-[#A98755] transition"
                  >
                    <UserRound size={19} />
                    <span className="text-xs font-medium">Account</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${accountOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {accountOpen && (
                    <div className="absolute right-0 top-14 w-56 bg-white border border-[#EAE3D8] shadow-xl rounded-xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">

                      <Link
                        to="/login"
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-[#302820] hover:bg-[#F8F5EF] transition"
                      >
                        <UserRound size={17} className="text-[#A98755]" />
                        Login
                      </Link>

                      <Link
                        to="/register"
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-[#302820] hover:bg-[#F8F5EF] transition"
                      >
                        <Sparkles size={17} className="text-[#A98755]" />
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
              className="relative w-10 h-10 flex items-center justify-center rounded-full text-[#302820] hover:bg-[#F0EADF] hover:text-[#A98755] transition"
            >
              <ShoppingBag size={21} strokeWidth={1.8} />
            </Link>

            {/* DESKTOP LOGOUT */}
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutLoading}
                className="hidden lg:flex items-center gap-2 text-xs font-medium text-[#51483D] hover:text-red-600 transition disabled:opacity-50"
              >
                <LogOut size={17} />
                {logoutLoading ? "Logging out..." : "Logout"}
              </button>
            )}

            {/* MOBILE MENU BUTTON */}
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full text-[#302820] hover:bg-[#F0EADF] transition"
              aria-label="Toggle menu"
            >
              {open ? <X size={23} /> : <Menu size={23} />}
            </button>

          </div>
        </nav>

        {/* MOBILE MENU */}
        {open && (
          <div className="md:hidden bg-[#FDFCF9] border-t border-[#EAE3D8] px-6 py-6 shadow-lg">

            <p className="text-[10px] tracking-[3px] uppercase text-[#A98755] mb-4">
              Explore Zenvora
            </p>

            <div className="flex flex-col">

              {navLinks.map(item => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={closeMenu}
                  className={`flex items-center justify-between py-4 border-b border-[#EEE8DE] text-sm transition ${
                    isLinkActive(item)
                      ? "text-[#A98755] font-semibold"
                      : "text-[#302820] hover:text-[#A98755]"
                  }`}
                >
                  {item.name}
                  <ChevronRight size={17} />
                </Link>
              ))}

              <Link
                to="/cart"
                onClick={closeMenu}
                className="flex items-center justify-between py-4 border-b border-[#EEE8DE] text-sm text-[#302820]"
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
                      className="py-4 border-b border-[#EEE8DE] text-sm text-[#302820]"
                    >
                      My Account
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={logoutLoading}
                      className="flex items-center gap-2 py-4 text-left text-sm text-red-600"
                    >
                      <LogOut size={17} />
                      {logoutLoading ? "Logging out..." : "Logout"}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className="py-4 border-b border-[#EEE8DE] text-sm text-[#302820]"
                    >
                      Login
                    </Link>

                    <Link
                      to="/register"
                      onClick={closeMenu}
                      className="py-4 text-sm text-[#302820]"
                    >
                      Create Account
                    </Link>
                  </>
                )
              )}

            </div>
          </div>
        )}
      </header>

      {/* SEARCH MODAL */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] bg-[#17130F]/70 backdrop-blur-sm px-3 sm:px-5 pt-16 md:pt-20 pb-6 overflow-y-auto"
          onClick={closeSearch}
        >
          <div
            className="bg-[#F8F6F1] w-full max-w-5xl mx-auto rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >

            <div className="flex items-center justify-between px-5 md:px-8 py-5 border-b border-[#DED4C4]">

              <div>
                <p className="text-[#AE8953] uppercase tracking-[3px] text-[10px]">
                  Zenvora Collection
                </p>

                <h2 className="font-serif text-2xl text-[#302820] mt-1">
                  Find Your Favorites
                </h2>
              </div>

              <button
                type="button"
                onClick={closeSearch}
                aria-label="Close search"
                className="w-10 h-10 rounded-full border border-[#D8C8AD] text-[#302820] hover:bg-[#302820] hover:text-white transition"
              >
                <X size={19} className="mx-auto" />
              </button>

            </div>

            <div className="p-5 md:p-8">

              <div className="flex items-center gap-3 bg-white border border-[#C6AD87] rounded-xl px-4 py-4 focus-within:border-[#A98755] focus-within:ring-2 focus-within:ring-[#A98755]/10 transition">

                <Search size={21} className="text-[#AE8953]" />

                <input
                  type="search"
                  autoFocus
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search products by name..."
                  className="w-full bg-transparent outline-none text-sm text-[#302820] placeholder:text-gray-500"
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="text-[#302820] hover:text-red-600"
                    aria-label="Clear search"
                  >
                    <X size={18} />
                  </button>
                )}

              </div>

              <div className="mt-7">

                {!searchTerm.trim() ? (
                  <div className="text-center py-12">
                    <Search size={30} className="mx-auto text-[#B99A6A] mb-3" />
                    <p className="text-[#766B5E] text-sm">
                      Search for your favorite products.
                    </p>
                  </div>
                ) : productLoading ? (
                  <p className="text-center py-12 text-[#302820]">
                    Loading products...
                  </p>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="font-serif text-xl text-[#302820]">
                        Search Results
                      </h3>

                      <span className="text-xs text-[#76572E]">
                        {searchResults.length} products found
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-h-[55vh] overflow-y-auto">
                      {searchResults.map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="font-serif text-xl text-[#302820]">
                      No Products Found
                    </p>

                    <p className="text-[#766B5E] text-sm mt-2">
                      Try another product name.
                    </p>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT TOAST */}
      {toast && (
        <div className="fixed top-24 right-4 sm:right-7 z-[200] w-[calc(100%-32px)] max-w-sm animate-in slide-in-from-right-5 fade-in duration-300">

          <div className="flex items-start gap-3 bg-white border border-[#EAE3D8] rounded-xl shadow-2xl p-4">

            {toast.type === "success" ? (
              <CheckCircle2
                size={23}
                className="text-green-600 shrink-0 mt-0.5"
              />
            ) : (
              <AlertCircle
                size={23}
                className="text-red-500 shrink-0 mt-0.5"
              />
            )}

            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[#302820]">
                {toast.title}
              </h3>

              <p className="text-xs text-[#766B5E] mt-1 leading-relaxed">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-[#766B5E] hover:text-[#302820]"
              aria-label="Close notification"
            >
              <X size={17} />
            </button>

          </div>
        </div>
      )}

    </>
  );
}
