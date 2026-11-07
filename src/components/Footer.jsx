import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  Mail,
  MapPin,
  ArrowRight,
  ShoppingBag
} from 'lucide-react'

import {
  FaFacebookF,
  FaInstagram
} from 'react-icons/fa'

import {
  collection,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore'

import { db } from '../firebase/config'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const handleSubscribe = async (e) => {
    e.preventDefault()

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) return

    setLoading(true)
    setMessage('')
    setMessageType('')

    try {
      // Create a private, deterministic document ID
      const hashBuffer = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(normalizedEmail)
      )

      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const emailId = hashArray
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('')

      // Save email to Firestore
      await setDoc(
        doc(collection(db, 'newsletter'), emailId),
        {
          email: normalizedEmail,
          createdAt: serverTimestamp()
        }
      )

      setMessage('Thank you! You are successfully subscribed.')
      setMessageType('success')
      setEmail('')

    } catch (error) {
      console.error('Newsletter error:', error)

      if (error.code === 'permission-denied') {
        setMessage(
          'This email may already be subscribed, or permission was denied.'
        )
      } else {
        setMessage('Something went wrong. Please try again.')
      }

      setMessageType('error')

    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="bg-[#302820] text-[#F8F6F1] mt-16">

      {/* NEWSLETTER */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-12 md:py-16 grid md:grid-cols-2 gap-8 items-center">

          <div>
            <p className="text-[#D5BB91] text-[10px] tracking-[4px] uppercase font-semibold">
              Stay in the loop
            </p>

            <h2 className="font-serif text-3xl md:text-4xl mt-4">
              A Little Luxury in Your Inbox.
            </h2>

            <p className="text-white/55 text-sm mt-3 leading-6">
              Discover new arrivals, curated collections and special updates
              from Zenvora.
            </p>
          </div>

          <div>
            <form
              onSubmit={handleSubscribe}
              className="flex border-b border-[#D5BB91]/60 pb-3 gap-3"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                disabled={loading}
                className="bg-transparent outline-none flex-1 min-w-0 text-sm text-white placeholder:text-white/40 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={loading}
                aria-label="Subscribe"
                className="text-[#D5BB91] hover:text-white transition disabled:opacity-50"
              >
                {loading ? (
                  <span className="text-xs">Sending...</span>
                ) : (
                  <ArrowRight size={23} />
                )}
              </button>
            </form>

            {message && (
              <p
                role="status"
                className={`text-xs mt-3 ${
                  messageType === 'success'
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              >
                {message}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* MAIN FOOTER */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 md:py-16">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* BRAND */}
          <div>
            <Link to="/" className="inline-block">
              <h2 className="font-serif text-4xl font-semibold tracking-tight">
                zenvora<span className="text-[#D5BB91]">.</span>
              </h2>
            </Link>

            <p className="text-[#D5BB91] text-[9px] tracking-[4px] uppercase mt-2">
              Beyond Ordinary
            </p>

            <p className="text-white/55 text-sm leading-7 mt-6 max-w-xs">
              Thoughtfully selected essentials, modern technology and
              timeless style. Discover something extraordinary with Zenvora.
            </p>

            <div className="flex gap-3 mt-7">

              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#D5BB91] hover:text-[#302820] hover:border-[#D5BB91] transition"
              >
                <FaFacebookF size={17} />
              </a>

              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#D5BB91] hover:text-[#302820] hover:border-[#D5BB91] transition"
              >
                <FaInstagram size={17} />
              </a>

            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="font-serif text-xl text-[#E8D2AE] mb-6">
              Explore
            </h3>

            <ul className="space-y-4 text-sm text-white/60">
              <li>
                <Link to="/" className="hover:text-[#D5BB91] transition">
                  Home
                </Link>
              </li>

              <li>
                <Link to="/shop" className="hover:text-[#D5BB91] transition">
                  Shop All
                </Link>
              </li>

              <li>
                <Link to="/shop" className="hover:text-[#D5BB91] transition">
                  Categories
                </Link>
              </li>

              <li>
                <Link to="/cart" className="hover:text-[#D5BB91] transition">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* CUSTOMER SERVICE */}
          <div>
            <h3 className="font-serif text-xl text-[#E8D2AE] mb-6">
              Customer Care
            </h3>

            <ul className="space-y-4 text-sm text-white/60">
              <li>
                <Link to="/profile" className="hover:text-[#D5BB91] transition">
                  My Account
                </Link>
              </li>

              <li>
                <Link to="/login" className="hover:text-[#D5BB91] transition">
                  Login / Register
                </Link>
              </li>

              <li>
                <Link to="/shop" className="hover:text-[#D5BB91] transition">
                  Browse Products
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="font-serif text-xl text-[#E8D2AE] mb-6">
              Get in Touch
            </h3>

            <div className="space-y-5 text-sm text-white/60">

              <div className="flex items-start gap-3">
                <Mail size={18} className="text-[#D5BB91] shrink-0 mt-0.5" />
                <span>Contact us through our support channel.</span>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-[#D5BB91] shrink-0 mt-0.5" />
                <span>Bangladesh</span>
              </div>

              <div className="flex items-start gap-3">
                <ShoppingBag size={18} className="text-[#D5BB91] shrink-0 mt-0.5" />
                <span>Online Shopping Experience</span>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-center">

          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} Zenvora. All rights reserved.
          </p>

          <p className="text-[#D5BB91] text-[10px] tracking-[3px] uppercase">
            Beyond Ordinary. Beyond Expectations.
          </p>

        </div>
      </div>

    </footer>
  )
}