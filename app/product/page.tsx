/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"]
});

interface Product {
  product_id: number;
  product_name: string;
  description: string;
  price: number;
  grade: string;
  photos: {
    front?: string;
    back?: string;
    detail?: string;
    label?: string;
    additional?: string;
  };
  status: string;
  category: string;
  seller: {
    user_name: string;
    location: string;
  };
}

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [filters, setFilters] = useState({
    grade: "",
    minPrice: "",
    maxPrice: ""
  });

  useEffect(() => {
    fetchProducts();
  }, [searchQuery]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (filters.grade) params.append("grade", filters.grade);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);

      const response = await fetch(`/api/products/search?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setProducts(result.products);
      } else {
        console.error("Failed to fetch products:", result.error);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchInput)}`);
    } else {
      router.push("/products");
    }
  };

  const applyFilters = () => {
    fetchProducts();
  };

  const clearFilters = () => {
    setFilters({ grade: "", minPrice: "", maxPrice: "" });
    setSearchInput("");
    router.push("/products");
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${plusJakarta.className}`}>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <h1 
              onClick={() => router.push("/")}
              className="text-2xl font-bold text-gray-800 cursor-pointer hover:text-green-600"
            >
              ReWear
            </h1>
            <form onSubmit={handleSearch} className="relative flex-1 max-w-2xl">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari produk..."
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">
                🔍
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar Filter */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Filter</h3>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Grade
                </label>
                <select
                  value={filters.grade}
                  onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Semua Grade</option>
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Harga
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <button
                onClick={applyFilters}
                className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 mb-2"
              >
                Terapkan Filter
              </button>
              <button
                onClick={clearFilters}
                className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Reset Filter
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {searchQuery && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Hasil pencarian untuk "{searchQuery}"
                </h2>
                <p className="text-sm text-gray-600">
                  {products.length} produk ditemukan
                </p>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-gray-600">Memuat produk...</div>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Produk tidak ditemukan
                </h3>
                <p className="text-gray-600 mb-4">
                  Coba kata kunci lain atau ubah filter pencarian
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                >
                  Reset Pencarian
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                {products.map((product) => {
                  const firstPhoto = product.photos?.front || product.photos?.back || product.photos?.detail || "/placeholder.jpg";
                  
                  return (
                    <div
                      key={product.product_id}
                      onClick={() => router.push(`/products/${product.product_id}`)}
                      className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                    >
                      <div className="relative">
                        <img
                          src={firstPhoto}
                          alt={product.product_name}
                          className="w-full h-56 object-cover"
                        />
                        {product.grade && (
                          <div className="absolute top-2 right-2 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            Grade {product.grade}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">
                          {product.product_name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        <p className="text-xl font-bold text-gray-800 mb-2">
                          Rp {product.price.toLocaleString('id-ID')}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>👤 {product.seller.user_name}</span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            {product.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}