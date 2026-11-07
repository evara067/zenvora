
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import { db, storage } from "../firebase/config";

import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Upload,
  X,
  Save,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";

const categories = [
  "Electronics",
  "Fashion",
  "Beauty & Skincare",
  "Watches",
  "Bags",
  "Home & Living",
  "Jewellery",
  "Sports & Fitness",
  "Gadgets",
  "Lifestyle",
];

const initialForm = {
  name: "",
  category: "Electronics",
  price: "",
  stock: "0",
  image: "",
  description: "",
  featured: false,
  bestSeller: false,
  newArrival: false,
};

export default function AdminProductManager() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const list = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setProducts(list);
        setFetching(false);
      },
      (err) => {
        console.error(err);
        setError("Unable to load products. Check Firestore Rules.");
        setFetching(false);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(imageFile);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setImageFile(null);
    setPreview("");
    setEditingId(null);

    const input = document.getElementById("product-image-file");
    if (input) input.value = "";
  };

  const uploadImage = async () => {
    if (!imageFile) return form.image;

    const safeName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");

    const imageRef = ref(
      storage,
      `products/${Date.now()}-${safeName}`
    );

    await uploadBytes(imageRef, imageFile);

    return await getDownloadURL(imageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please enter product name.");
      return;
    }

    if (
      form.price === "" ||
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) < 0
    ) {
      setError("Please enter a valid product price.");
      return;
    }

    if (
      !Number.isFinite(Number(form.stock)) ||
      Number(form.stock) < 0
    ) {
      setError("Please enter valid stock quantity.");
      return;
    }

    if (!form.image && !imageFile) {
      setError("Please upload a product image.");
      return;
    }

    if (imageFile) {
      if (!imageFile.type.startsWith("image/")) {
        setError("Please select a valid image.");
        return;
      }

      if (imageFile.size > 5 * 1024 * 1024) {
        setError("Image size must be below 5MB.");
        return;
      }
    }

    try {
      setLoading(true);

      const image = await uploadImage();

      const productData = {
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
        image,
        description: form.description.trim(),
        featured: form.featured,
        bestSeller: form.bestSeller,
        newArrival: form.newArrival,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(
          doc(db, "products", editingId),
          productData
        );

        alert("Product updated successfully!");
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: serverTimestamp(),
        });

        alert("Product added successfully!");
      }

      resetForm();
    } catch (err) {
      console.error("Product Save Error:", err);
      setError(err.message || "Unable to save product.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);

    setForm({
      name: product.name || "",
      category: product.category || "Electronics",
      price: product.price ?? "",
      stock: product.stock ?? 0,
      image: product.image || "",
      description: product.description || "",
      featured: Boolean(product.featured),
      bestSeller: Boolean(product.bestSeller),
      newArrival: Boolean(product.newArrival),
    });

    setImageFile(null);
    setPreview("");

    document.getElementById("product-image")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product permanently?")) return;

    try {
      await deleteDoc(doc(db, "products", id));
      alert("Product deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Unable to delete product: " + err.message);
    }
  };

  const inputStyle =
    "w-full min-w-0 bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-yellow-500";

  return (
    <section className="mb-10 space-y-7 w-full min-w-0">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black">
            Product Management
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Manage your Zenvora products.
          </p>
        </div>

        <div className="bg-[#1c1c1c] border border-yellow-600/30 rounded-xl px-5 py-3">
          <p className="text-gray-400 text-xs">TOTAL PRODUCTS</p>
          <p className="text-yellow-400 text-2xl font-black">
            {products.length}
          </p>
        </div>
      </div>

      {/* Form */}
      <div
        id="product-image"
        className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-4 sm:p-6 md:p-7"
      >
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-yellow-400 flex items-center gap-2">
            <Plus size={21} />
            {editingId ? "Edit Product" : "Add New Product"}
          </h3>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-red-400 flex items-center gap-1 text-sm"
            >
              <X size={17} /> Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Product Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={inputStyle}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Price (৳) *
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
                required
                placeholder="2500"
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                min="0"
                placeholder="20"
                className={inputStyle}
              />
            </div>

          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Product Image *
            </label>

            <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-yellow-600/30 rounded-xl p-6 cursor-pointer hover:border-yellow-500 transition">
              <ImageIcon size={32} className="text-yellow-500" />
              <span className="text-sm text-gray-300 text-center">
                Tap to select product image
              </span>
              <span className="text-xs text-gray-500">
                JPG, PNG, WEBP • Maximum 5MB
              </span>

              <input
                id="product-image-file"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImageFile(e.target.files?.[0] || null)
                }
                className="hidden"
              />
            </label>

            {(preview || form.image) && (
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <img
                  src={preview || form.image}
                  alt="Product preview"
                  className="w-28 h-28 object-contain bg-white rounded-xl p-2"
                />
                <div className="min-w-0">
                  <p className="text-green-400 text-sm break-all">
                    {imageFile?.name || "Current product image"}
                  </p>
                  {imageFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        const input = document.getElementById(
                          "product-image-file"
                        );
                        if (input) input.value = "";
                      }}
                      className="text-red-400 text-sm mt-2"
                    >
                      Remove selected image
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Write product details..."
              className={`${inputStyle} resize-y`}
            />
          </div>

          {/* Labels */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              ["featured", "Featured"],
              ["bestSeller", "Best Seller"],
              ["newArrival", "New Arrival"],
            ].map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-3 bg-[#111] border border-white/10 rounded-xl p-3 text-sm"
              >
                <input
                  type="checkbox"
                  name={key}
                  checked={form[key]}
                  onChange={handleChange}
                  className="accent-yellow-500 w-5 h-5"
                />
                {label}
              </label>
            ))}
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg break-words">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-black font-bold px-6 py-4 rounded-xl hover:bg-yellow-400 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={19} />
            ) : editingId ? (
              <Save size={19} />
            ) : (
              <Upload size={19} />
            )}

            {loading
              ? "Saving..."
              : editingId
                ? "Update Product"
                : "Save Product"}
          </button>

        </form>
      </div>

      {/* Product List */}
      <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-4 sm:p-6 md:p-7">

        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Package className="text-yellow-500" />
          All Products ({products.length})
        </h3>

        {fetching && (
          <p className="text-gray-400 py-8 text-center">
            Loading products...
          </p>
        )}

        {!fetching && products.length === 0 && (
          <p className="text-gray-400 text-center py-10">
            No products found.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {products.map((product) => (
            <div
              key={product.id}
              className="bg-[#111] border border-white/10 rounded-xl overflow-hidden min-w-0"
            >
              <div className="h-44 bg-white flex items-center justify-center">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-3"
                  />
                ) : (
                  <ImageIcon size={35} className="text-gray-400" />
                )}
              </div>

              <div className="p-4">
                <h4 className="font-bold truncate">
                  {product.name}
                </h4>

                <p className="text-xs text-gray-400 mt-1">
                  {product.category}
                </p>

                <div className="flex justify-between items-center gap-2 mt-3">
                  <span className="text-yellow-400 font-bold">
                    ৳{Number(product.price || 0).toLocaleString("en-BD")}
                  </span>

                  <span className="text-xs text-gray-400">
                    Stock: {product.stock ?? 0}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => handleEdit(product)}
                    className="flex justify-center items-center gap-2 bg-blue-600/20 text-blue-400 rounded-lg py-3 text-sm hover:bg-blue-600 hover:text-white transition"
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    className="flex justify-center items-center gap-2 bg-red-600/20 text-red-400 rounded-lg py-3 text-sm hover:bg-red-600 hover:text-white transition"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>

    </section>
  );
}
