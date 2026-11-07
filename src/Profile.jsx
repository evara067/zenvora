import { useEffect, useState } from "react";
import { auth, db } from "./firebase/config.js";
import {
  onAuthStateChanged,
  signOut,
  updateProfile
} from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";
import { Link, Navigate, useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const snapshot = await getDoc(userRef);

          if (snapshot.exists()) {
            const data = snapshot.data();
            setName(data.name || "");
            setPhone(data.phone || "");
          }
        } catch (error) {
          console.error(error);
          alert("Could not load profile.");
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    try {
      const userRef = doc(db, "users", user.uid);

      await updateDoc(userRef, {
        name: name,
        phone: phone
      });

      await updateProfile(user, {
        displayName: name
      });

      setUser({ ...user, displayName: name });
      setEditing(false);

      alert("Profile Updated Successfully!");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (loading) {
    return <p className="text-center py-20">Loading Profile...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center px-5 py-12">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
            {(name || user.email || "U").charAt(0).toUpperCase()}
          </div>

          <h2 className="text-2xl font-bold mt-4">
            My Account
          </h2>

          <p className="text-gray-500 mt-1">
            Welcome to Zenvora!
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-500 mb-2">
            Full Name
          </label>
          {editing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-xl p-3"
            />
          ) : (
            <p className="border rounded-xl p-3 font-semibold">
              {name || "Not Provided"}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-500 mb-2">
            Email Address
          </label>
          <p className="border rounded-xl p-3 font-semibold break-all">
            {user.email}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-500 mb-2">
            Phone Number
          </label>
          {editing ? (
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className="w-full border rounded-xl p-3"
            />
          ) : (
            <p className="border rounded-xl p-3 font-semibold">
              {phone || "Not Provided"}
            </p>
          )}
        </div>

        {editing ? (
          <div className="flex gap-3 mb-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold"
            >
              Save Changes
            </button>

            <button
              onClick={() => setEditing(false)}
              className="flex-1 bg-gray-200 py-3 rounded-xl font-semibold"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold mb-4"
          >
            Edit Profile
          </button>
        )}

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold mb-4"
        >
          Logout
        </button>

        <Link
          to="/"
          className="block text-center border border-purple-600 text-purple-600 py-3 rounded-xl font-semibold"
        >
          Back to Home
        </Link>

      </div>
    </div>
  );
}