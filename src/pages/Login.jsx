import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password
    );

    console.log("LOGIN SUCCESS");
    console.log("Logged in Email:", userCredential.user.email);
    console.log("Logged in UID:", userCredential.user.uid);

    navigate("/", { replace: true });

  } catch (err) {
    console.error("LOGIN ERROR CODE:", err.code);
    console.error("LOGIN ERROR MESSAGE:", err.message);

    if (err.code === "auth/invalid-credential") {
      setError("Email or password is incorrect. Please check your credentials.");
    } else if (err.code === "auth/too-many-requests") {
      setError("Too many attempts. Please try again later.");
    } else if (err.code === "auth/user-disabled") {
      setError("This account has been disabled.");
    } else if (err.code === "auth/network-request-failed") {
      setError("Network error. Please check your internet.");
    } else {
      setError(err.message);
    }
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen bg-[#090909] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md bg-[#151515] border border-[#b99752]/30 rounded-2xl p-8 shadow-2xl">

        <Link to="/" className="block text-center text-3xl font-black text-[#d6b46a] mb-3">
          zenvora.
        </Link>

        <h1 className="text-white text-3xl font-bold text-center mt-6">
          Welcome Back
        </h1>

        <p className="text-gray-400 text-center mt-2 mb-8">
          Sign in to your Zenvora account
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-5 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">

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

          <div>
            <label className="text-gray-300 text-sm block mb-2">
              Password
            </label>
            <div className="flex items-center bg-[#202020] border border-gray-700 rounded-lg px-4">
              <LockKeyhole size={18} className="text-[#d6b46a]" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-transparent p-4 text-white outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c6a15b] hover:bg-[#dfbd79] text-black font-bold py-4 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Signing In..." : "LOGIN"}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-7 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#d6b46a] font-semibold hover:underline">
            Create Account
          </Link>
        </p>

        <Link to="/" className="block text-center text-gray-500 text-sm mt-5 hover:text-white">
          ← Back to Home
        </Link>

      </div>
    </div>
  );
}