
import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { Plus, Trash2, Edit, Package, Image } from "lucide-react";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    image: "",
    description: ""
  });

  const loadProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));
    setProducts(snapshot.docs.map(item => ({
      id: item.id,
      ...item.data()
    })));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...form,
        price: Number(form.price),
        updatedAt: new Date().toISOString()

      };

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), productData);
        alert("Product updated successfully!");
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: new Date().toISOString()
        });
        alert("Product added successfully!");
      }

      setForm({
        name: "",
        category: "",
        price: "",
        image: "",
        description: ""
      });

      setEditingId(null);
      await loadProducts();

    } catch (error) {
      alert(error.message);
    }

    setLoading(false);
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name || "",
      category: product.category || "",
      price: product.price || "",
      image: product.image || "",
      description: product.description || ""
    });

    setEditingId(product.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await deleteDoc(doc(db, "products", id));
      await loadProducts();
      alert("Product deleted!");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">

      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Zenvora Admin
          </h1>
          <p className="text-slate-500 mt-2">
            Manage your online store products
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <Package className="text-purple-600 mb-3" size={28} />
            <p className="text-slate-500">Total Products</p>
            <h2 className="text-3xl font-bold">{products.length}</h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm md:col-span-2">
            <h2 className="font-bold text-lg">Product Management</h2>
            <p className="text-slate-500 mt-2">
              Add, edit and remove products from your store.
            </p>
          </div>

        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">

          <h2 className="text-xl font-bold mb-6">
            {editingId ? "Edit Product" : "Add New Product"}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <input
              name="name"
              placeholder="Product Name"
              value={form.name}
              onChange={handleChange}
              required
              className="border rounded-xl p-3"
            />

            <input
              name="category"
              placeholder="Category (Phones, Fashion...)"
              value={form.category}
              onChange={handleChange}
              required
              className="border rounded-xl p-3"
            />

            <input
              name="price"
              type="number"
              placeholder="Price"
              min="0"
              value={form.price}
              onChange={handleChange}
              required
              className="border rounded-xl p-3"
            />

            <input
              name="image"
              placeholder="Product Image URL"
              value={form.image}
              onChange={handleChange}
              required
              className="border rounded-xl p-3"
            />

            <textarea
              name="description"
              placeholder="Product Description"
              value={form.description}
              onChange={handleChange}
              className="border rounded-xl p-3 md:col-span-2"
              rows="3"
            />

            {form.image && (
              <div className="md:col-span-2">
                <p className="text-sm mb-2 text-slate-500">Image Preview</p>
                <img
                  src={form.image}
                  alt="Product Preview"
                  className="w-32 h-32 object-cover rounded-xl"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl font-semibold md:col-span-2"
            >
              <Plus className="inline mr-2" size={18} />
              {loading ? "Please wait..." : editingId ? "Update Product" : "Add Product"}
            </button>

          </form>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">

          <h2 className="text-xl font-bold mb-6">All Products</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {products.map(product => (
              <div key={product.id} className="border rounded-2xl overflow-hidden">

                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />

                <div className="p-4">
                  <h3 className="font-bold">{product.name}</h3>
                  <p className="text-sm text-slate-500">{product.category}</p>
                  <p className="text-purple-600 font-bold mt-2">
                    ৳{product.price}
                  </p>

                  <div className="flex gap-3 mt-4">

                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-blue-50 text-blue-600 p-2 rounded-lg"
                    >
                      <Edit size={17} className="inline mr-1" />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 bg-red-50 text-red-600 p-2 rounded-lg"
                    >
                      <Trash2 size={17} className="inline mr-1" />
                      Delete
                    </button>

                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
}
