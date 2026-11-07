import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth, db } from "../firebase/config";
import {
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  LockKeyhole,
  Phone
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Create Firebase Authentication account
      const result = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // Save user's display name
      await updateProfile(result.user, {
        displayName: name.trim()
      });

      // Save user information in Firestore
      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        createdAt: serverTimestamp()
      });

      alert("Account Created Successfully!");

      navigate("/");
    } catch (err) {
      console.error("Registration Error:", err);

      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak.");
      } else if (err.code === "permission-denied") {
        setError("Database permission denied. Please check Firestore Rules.");
      } else {
        setError(err.message || "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] flex items-center justify-center px-5 py-12">

      <div className="w-full max-w-md bg-[#151515] border border-[#b99752]/30 rounded-2xl p-8 shadow-2xl">

        <Link
          to="/"
          className="block text-center text-3xl font-black text-[#d6b46a] mb-3"
        >
          zenvora.
        </Link>

        <h1 className="text-white text-3xl font-bold text-center mt-6">
          Create Account
        </h1>

        <p className="text-gray-400 text-center mt-2 mb-8">
          Join Zenvora today
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-5 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">

          {/* FULL NAME */}
          <div>
            <label className="text-gray-300 text-sm block mb-2">
              Full Name
            </label>

            <div className="flex items-center bg-[#202020] border border-gray-700 rounded-lg px-4">
              <User size={18} className="text-[#d6b46a]" />

              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full bg-transparent p-4 text-white outline-none"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-gray-300 text-sm block mb-2">
              Email Address
            </label>

            <div className="flex items-center bg-[#202020] border border-gray-700 rounded-lg px-4">
              <Mail size={18} className="text-[#d6b46a]" />

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent p-4 text-white outline-none"
              />
            </div>
          </div>

          {/* PHONE */}
          <div>
            <label className="text-gray-300 text-sm block mb-2">
              Phone Number
            </label>

            <div className="flex items-center bg-[#202020] border border-gray-700 rounded-lg px-4">
              <Phone size={18} className="text-[#d6b46a]" />

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full bg-transparent p-4 text-white outline-none"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-gray-300 text-sm block mb-2">
              Password
            </label>

            <div className="flex items-center bg-[#202020] border border-gray-700 rounded-lg px-4">
              <LockKeyhole size={18} className="text-[#d6b46a]" />

              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-transparent p-4 text-white outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="text-gray-300 text-sm block mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full bg-[#202020] border border-gray-700 rounded-lg p-4 text-white outline-none focus:border-[#d6b46a]"
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c6a15b] hover:bg-[#dfbd79] text-black font-bold py-4 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "CREATE ACCOUNT"}
          </button>

        </form>

        <p className="text-gray-400 text-center mt-7 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#d6b46a] font-semibold hover:underline"
          >
            Login
          </Link>
        </p>

        <Link
          to="/"
          className="block text-center text-gray-500 text-sm mt-5 hover:text-white"
        >
          ← Back to Home
        </Link>

      </div>
    </div>
  );
}