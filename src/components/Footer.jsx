
import { useState } from "react";
import { Link } from "react-router-dom";

import {
  Mail,
  MapPin,
  ArrowRight,
  ShoppingBag
} from "lucide-react";

import { FaFacebookF, FaInstagram } from "react-icons/fa";

import {
  collection,
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../firebase/config";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleSubscribe = async e => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) return;

    setLoading(true);
    setMessage("");

    try {
      const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(normalizedEmail)
      );

      const hashArray = Array.from(new Uint8Array(hashBuffer));

      const emailId = hashArray
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");

      await setDoc(
        doc(collection(db, "newsletter"), emailId),
        {
          email: normalizedEmail,
          createdAt: serverTimestamp()
        }
      );

      setMessage("Thank you! You are successfully subscribed.");
      setMessageType("success");
      setEmail("");

    } catch (error) {
      console.error("Newsletter error:", error);

      setMessage(
        error.code === "permission-denied"
          ? "Subscription permission denied. Please try again later."
          : "Something went wrong. Please try again."
      );

      setMessageType("error");

    } finally {
      setLoading(false);
    }
  };

  const linkClass =
    "text-[#E2D9CC] hover:text-[#F0CC8D] transition-colors duration-200";

  return (
    <footer className="bg-[#302820] text-[#F8F6F1] mt-16">

      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-12 md:py-16 grid md:grid-cols-2 gap-8 items-center">

          <div>
            <p className="text-[#D5BB91] text-[10px] tracking-[4px] uppercase font-semibold">
              Stay in the loop
            </p>

            <h2 className="font-serif text-3xl md:text-4xl mt-4">
              A Little Luxury in Your Inbox.
            </h2>

            <p className="text-white/75 text-sm mt-3 leading-6">
              Discover new arrivals, curated collections and special updates
              from Zenvora.
            </p>
          </div>

          <div>
            <form
              onSubmit={handleSubscribe}
              className="flex border-b border-[#D5BB91]/70 pb-3 gap-3"
            >
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                disabled={loading}
                className="bg-transparent outline-none flex-1 min-w-0 text-sm text-white placeholder:text-white/60"
              />

              <button
                type="submit"
                disabled={loading}
                className="text-[#F0CC8D] hover:text-white transition disabled:opacity-50"
              >
                {loading ? "Sending..." : <ArrowRight size={23} />}
              </button>
            </form>

            {message && (
              <p className={`text-xs mt-3 ${
                messageType === "success"
                  ? "text-green-300"
                  : "text-red-300"
              }`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

          <div>
            <Link to="/" className="inline-block">
              <h2 className="font-serif text-4xl font-semibold tracking-tight">
                zenvora<span className="text-[#D5BB91]">.</span>
              </h2>
            </Link>

            <p className="text-[#D5BB91] text-[9px] tracking-[4px] uppercase mt-2">
              Beyond Ordinary
            </p>

            <p className="text-white/75 text-sm leading-7 mt-6 max-w-xs">
              Thoughtfully selected essentials, modern technology and
              timeless style. Discover something extraordinary with Zenvora.
            </p>

            <div className="flex gap-3 mt-7">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-[#D5BB91] hover:text-[#302820] transition"
              >
                <FaFacebookF size={17} />
              </a>

              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-[#D5BB91] hover:text-[#302820] transition"
              >
                <FaInstagram size={17} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-xl text-[#E8D2AE] mb-6">
              Explore
            </h3>

            <ul className="space-y-4 text-sm">
              <li><Link to="/" className={linkClass}>Home</Link></li>
              <li><Link to="/shop" className={linkClass}>Shop All</Link></li>
              <li><Link to="/shop?view=categories" className={linkClass}>Categories</Link></li>
              <li><Link to="/cart" className={linkClass}>Shopping Cart</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-xl text-[#E8D2AE] mb-6">
              Customer Care
            </h3>

            <ul className="space-y-4 text-sm">
              <li><Link to="/profile" className={linkClass}>My Account</Link></li>
              <li><Link to="/login" className={linkClass}>Login / Register</Link></li>
              <li><Link to="/shop" className={linkClass}>Browse Products</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-xl text-[#E8D2AE] mb-6">
              Get in Touch
            </h3>

            <div className="space-y-5 text-sm text-white/75">
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-[#D5BB91] shrink-0" />
                <span>Contact us through our support channel.</span>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-[#D5BB91] shrink-0" />
                <span>Bangladesh</span>
              </div>

              <div className="flex items-start gap-3">
                <ShoppingBag size={18} className="text-[#D5BB91] shrink-0" />
                <span>Online Shopping Experience</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-center">
          <p className="text-white/65 text-xs">
            © {new Date().getFullYear()} Zenvora. All rights reserved.
          </p>

          <p className="text-[#D5BB91] text-[10px] tracking-[3px] uppercase">
            Beyond Ordinary. Beyond Expectations.
          </p>
        </div>
      </div>
    </footer>
  );
}
