
import { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import AdminProductManager from "../components/AdminProductManager";
import { onAuthStateChanged } from "firebase/auth";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import {
  ShoppingBag,
  Clock,
  Wallet,
  Trash2,
  Package,
  XCircle,
  RefreshCw,
  MessageSquare,
} from "lucide-react";

const ADMIN_UID = "YQmIqIxPGJPcH6urBJGMjZWbNwB3";

const statuses = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [updating, setUpdating] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user || user.uid !== ADMIN_UID) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const unsubscribe = onSnapshot(
      collection(db, "orders"),
      (snapshot) => {
        const orderList = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        orderList.sort((a, b) => {
          const dateA = a.createdAt?.toMillis?.() || 0;
          const dateB = b.createdAt?.toMillis?.() || 0;
          return dateB - dateA;
        });

        setOrders(orderList);
        setLoading(false);
      },
      (err) => {
        console.error("Orders Error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user, authLoading]);

  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdating(orderId);

      await updateDoc(doc(db, "orders", orderId), {
        status,
      });
    } catch (error) {
      console.error(error);
      alert("Unable to update order status: " + error.message);
    } finally {
      setUpdating("");
    }
  };

  const handleDelete = async (orderId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this order?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "orders", orderId));
      alert("Order deleted successfully!");
    } catch (error) {
      console.error(error);
      alert("Delete failed: " + error.message);
    }
  };

  const pendingOrders = orders.filter(
    (order) => (order.status || "Pending") === "Pending"
  ).length;

  const totalValue = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const demoSMSCount = orders.filter(
    (order) => order.smsStatus === "demo_not_sent"
  ).length;

  const sentSMSCount = orders.filter(
    (order) => order.smsStatus === "sent"
  ).length;

  const failedSMSCount = orders.filter(
    (order) => order.smsStatus === "failed"
  ).length;

  const getSMSInfo = (status) => {
    if (status === "sent") {
      return {
        label: "SMS Sent",
        style: "bg-green-500/15 text-green-400 border-green-500/30",
      };
    }

    if (status === "failed") {
      return {
        label: "SMS Failed",
        style: "bg-red-500/15 text-red-400 border-red-500/30",
      };
    }

    if (status === "demo_not_sent") {
      return {
        label: "Demo – Not Sent",
        style: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
      };
    }

    return {
      label: "Not Available",
      style: "bg-gray-500/15 text-gray-400 border-gray-500/30",
    };
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "Date unavailable";

    return timestamp.toDate().toLocaleString("en-BD");
  };

  const getStatusStyle = (status) => {
    const styles = {
      Pending: "bg-yellow-100 text-yellow-800",
      Processing: "bg-blue-100 text-blue-800",
      Shipped: "bg-purple-100 text-purple-800",
      Delivered: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
    };

    return styles[status] || styles.Pending;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#101010] text-white flex items-center justify-center">
        Checking admin access...
      </div>
    );
  }

  if (!user || user.uid !== ADMIN_UID) {
    return (
      <div className="min-h-screen bg-[#101010] text-white flex flex-col items-center justify-center p-5">
        <XCircle size={55} className="text-red-500 mb-4" />
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-gray-400 mt-2 text-center">
          You are not authorized to access this dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101010] text-white p-4 md:p-10">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-wrap justify-between items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-black">
              zenvora<span className="text-yellow-500">.</span>
              <span className="text-yellow-500"> Admin</span>
            </h1>

            <p className="text-gray-400 mt-2">
              Manage your store and customer orders.
            </p>
          </div>

          <div className="border border-yellow-600/40 rounded-xl px-5 py-3">
            <p className="text-xs text-gray-400">ADMIN ACCOUNT</p>
            <p className="text-yellow-400 font-bold text-sm">
              {user.email}
            </p>
          </div>
        </div>

        {/* DASHBOARD STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">

          <div className="bg-[#1c1c1c] border border-white/10 p-6 rounded-2xl">
            <ShoppingBag className="text-yellow-500 mb-4" size={27} />
            <p className="text-gray-400">Total Orders</p>
            <h2 className="text-3xl font-black mt-2">
              {orders.length}
            </h2>
          </div>

          <div className="bg-[#1c1c1c] border border-white/10 p-6 rounded-2xl">
            <Clock className="text-orange-400 mb-4" size={27} />
            <p className="text-gray-400">Pending Orders</p>
            <h2 className="text-3xl font-black text-orange-400 mt-2">
              {pendingOrders}
            </h2>
          </div>

          <div className="bg-[#1c1c1c] border border-white/10 p-6 rounded-2xl">
            <Wallet className="text-yellow-500 mb-4" size={27} />
            <p className="text-gray-400">Total Order Value</p>
            <h2 className="text-3xl font-black text-yellow-400 mt-2">
              ৳{totalValue.toLocaleString("en-BD")}
            </h2>
          </div>

        </div>

        {/* SMS STATISTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">

          <div className="bg-[#1c1c1c] border border-yellow-500/20 p-6 rounded-2xl">
            <MessageSquare className="text-yellow-400 mb-4" size={27} />
            <p className="text-gray-400">Demo SMS</p>
            <h2 className="text-3xl font-black text-yellow-400 mt-2">
              {demoSMSCount}
            </h2>
            <p className="text-xs text-gray-500 mt-2">Not actually sent</p>
          </div>

          <div className="bg-[#1c1c1c] border border-green-500/20 p-6 rounded-2xl">
            <MessageSquare className="text-green-400 mb-4" size={27} />
            <p className="text-gray-400">SMS Sent</p>
            <h2 className="text-3xl font-black text-green-400 mt-2">
              {sentSMSCount}
            </h2>
          </div>

          <div className="bg-[#1c1c1c] border border-red-500/20 p-6 rounded-2xl">
            <MessageSquare className="text-red-400 mb-4" size={27} />
            <p className="text-gray-400">SMS Failed</p>
            <h2 className="text-3xl font-black text-red-400 mt-2">
              {failedSMSCount}
            </h2>
          </div>

        </div>

        <AdminProductManager />

        {/* CUSTOMER ORDERS */}
        <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-5 md:p-7 mt-10">

          <div className="flex justify-between items-center mb-7">
            <div>
              <h2 className="text-2xl font-black">
                Customer Orders
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Manage and track all orders.
              </p>
            </div>

            <RefreshCw className="text-yellow-500" size={24} />
          </div>

          {loading && (
            <p className="text-center py-10 text-gray-400">
              Loading orders...
            </p>
          )}

          {error && (
            <div className="text-red-400 py-5 break-words">
              Orders Error: {error}
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="text-center py-14">
              <Package size={45} className="mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400">No orders found yet.</p>
            </div>
          )}

          <div className="space-y-6">

            {orders.map((order) => {
              const smsInfo = getSMSInfo(order.smsStatus);

              return (
                <div
                  key={order.id}
                  className="border border-white/10 rounded-2xl p-5 md:p-6"
                >

                  <div className="flex flex-wrap justify-between gap-4 mb-6">

                    <div>
                      <h3 className="font-bold text-xl">
                        {order.customer?.name || "Unknown Customer"}
                      </h3>

                      <p className="text-sm text-gray-400 mt-1">
                        Order ID: {order.id}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-2">

                      <span className={`h-fit px-4 py-2 rounded-full text-sm font-bold ${getStatusStyle(order.status || "Pending")}`}>
                        {order.status || "Pending"}
                      </span>

                      {/* SMS STATUS */}
                      <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border ${smsInfo.style}`}>
                        <MessageSquare size={14} />
                        {smsInfo.label}
                      </span>

                    </div>

                  </div>

                  <div className="bg-[#111] rounded-xl p-4 mb-6">

                    <h4 className="font-bold text-yellow-400 mb-3">
                      Customer Information
                    </h4>

                    <p className="text-sm mb-2">
                      <strong>Name:</strong> {order.customer?.name || "N/A"}
                    </p>

                    <p className="text-sm mb-2">
                      <strong>Email:</strong> {order.customer?.email || "N/A"}
                    </p>

                    <p className="text-sm mb-2">
                      <strong>Phone:</strong> {order.customer?.phone || "N/A"}
                    </p>

                    <p className="text-sm break-words">
                      <strong>Address:</strong> {order.customer?.address || "N/A"}
                    </p>

                  </div>

                  <h4 className="font-bold mb-4">
                    Ordered Products
                  </h4>

                  <div className="space-y-4">

                    {(order.items || []).map((item, index) => (

                      <div
                        key={`${item.id || item.name}-${index}`}
                        className="flex items-center gap-4 border-b border-white/10 pb-4"
                      >

                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name || "Product"}
                            className="w-16 h-16 object-contain bg-white rounded-lg p-1"
                          />
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="font-bold">
                            {item.name || "Product"}
                          </p>

                          <p className="text-sm text-gray-400 mt-1">
                            ৳{item.price} × {item.quantity}
                          </p>
                        </div>

                        <p className="font-bold text-yellow-400">
                          ৳{(
                            Number(item.price || 0) *
                            Number(item.quantity || 0)
                          ).toLocaleString("en-BD")}
                        </p>

                      </div>

                    ))}

                  </div>

                  <div className="flex justify-between items-center mt-6 pt-5 border-t border-white/10">
                    <span className="font-bold">Total Amount</span>

                    <span className="text-xl font-black text-yellow-400">
                      ৳{Number(order.total || 0).toLocaleString("en-BD")}
                    </span>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">

                    <div className="flex-1">

                      <label className="block text-sm text-gray-400 mb-2">
                        Update Order Status
                      </label>

                      <select
                        value={order.status || "Pending"}
                        disabled={updating === order.id}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        className="w-full bg-[#111] border border-yellow-600/30 rounded-xl px-4 py-3 outline-none focus:border-yellow-500 text-white"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                    </div>

                    <div className="flex items-end">

                      <button
                        onClick={() => handleDelete(order.id)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600/15 text-red-400 border border-red-500/30 px-5 py-3 rounded-xl hover:bg-red-600 hover:text-white transition"
                      >
                        <Trash2 size={18} />
                        Delete Order
                      </button>

                    </div>

                  </div>

                  {updating === order.id && (
                    <p className="text-yellow-400 text-xs mt-3">
                      Updating order status...
                    </p>
                  )}

                </div>
              );
            })}

          </div>
        </div>

      </div>
    </div>
  );
}
