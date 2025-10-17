// app/page.tsx
"use client";

import { Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"]
});

interface Donation {
  donation_id: number;
  donation_target: string;
  donation_desc: string;
  target_quantity: number;
  current_quantity: number;
  campaign_photo_url: string;
  organization: {
    organization_name: string;
  };
}

interface Product {
  product_id: number;
  product_name: string;
  price: number;
  grade: string;
  photo: string;
  photos?: {
    front?: string;
  };
}

export default function Home() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Hero slides
  const heroSlides = [
    {
      title: "Uniting Threads and Trees for Better Earth",
      subtitle: "Bergabunglah dalam gerakan fashion berkelanjutan",
      image: "/hero1.jpg",
      color: "from-emerald-600 to-teal-600"
    },
    {
      title: "Fashion Berkelanjutan Dimulai dari Kamu",
      subtitle: "Setiap pakaian bekas punya cerita baru",
      image: "/hero2.jpg",
      color: "from-blue-600 to-cyan-600"
    },
    {
      title: "Belanja Cerdas, Selamatkan Bumi",
      subtitle: "Kurangi limbah tekstil dengan gaya",
      image: "/hero3.jpg",
      color: "from-purple-600 to-pink-600"
    }
  ];

  useEffect(() => {
    fetchDonations();
    fetchProducts();
    
    // Auto slide hero
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await fetch("/api/donations/list");
      const result = await response.json();
      if (result.success) {
        setDonations(result.donations.slice(0, 1)); // Ambil 1 donasi pertama
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products?status=unsold");
      const result = await response.json();
      if (result.success) {
        // Tampilkan semua produk
        setProducts(result.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
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

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className={`min-h-screen bg-white ${plusJakarta.className}`}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-gray-800 cursor-pointer hover:text-green-600">
              ReWear
            </h1>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-green-600 font-medium">
              Home
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-green-600 font-medium">
              Produk
            </Link>
            <Link href="/donations" className="text-gray-700 hover:text-green-600 font-medium">
              Donasi
            </Link>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              🔔
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full relative">
              🛒
              <span className="absolute top-0 right-0 bg-purple-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                0
              </span>
            </button>
          </nav>
        </div>
      </header>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari produk pakaian bekas..."
            className="w-full px-6 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button 
            type="submit" 
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700"
          >
            🔍
          </button>
        </form>
      </div>

      {/* Hero Carousel */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <div className="relative h-96 rounded-3xl overflow-hidden">
          {heroSlides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-700 ${
                idx === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className={`w-full h-full bg-gradient-to-r ${slide.color} flex items-center justify-center`}>
                <div className="text-center text-white px-8">
                  <h2 className="text-5xl font-bold mb-4">{slide.title}</h2>
                  <p className="text-xl mb-6">{slide.subtitle}</p>
                  <button 
                    onClick={() => router.push("/products")}
                    className="bg-white text-gray-800 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm w-12 h-12 rounded-full shadow-lg hover:bg-white flex items-center justify-center"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm w-12 h-12 rounded-full shadow-lg hover:bg-white flex items-center justify-center"
          >
            ›
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentSlide ? "bg-white w-8" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Donations Section */}
      {donations.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Donasi</h2>
              <p className="text-gray-600">Ayo donasikan pakaianmu!</p>
            </div>
            <Link 
              href="/donations"
              className="text-green-600 hover:text-green-700 font-medium flex items-center gap-2"
            >
              Lihat Selengkapnya →
            </Link>
          </div>

          {donations.map((donation) => {
            const progress = calculateProgress(
              donation.current_quantity,
              donation.target_quantity
            );

            return (
              <div
                key={donation.donation_id}
                onClick={() => router.push(`/donations/${donation.donation_id}`)}
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="flex">
                  <div className="flex-1 p-8">
                    <p className="text-sm text-gray-500 mb-2">Donasi yang sedang berlangsung</p>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      {donation.donation_target}
                    </h3>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>{donation.current_quantity} dari {donation.target_quantity} pakaian</span>
                        <span className="font-bold text-purple-600">{progress}% terkumpul</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-400 h-3 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {donation.campaign_photo_url && (
                    <div 
                      className="w-96 flex-shrink-0"
                      style={{
                        backgroundImage: `url(${donation.campaign_photo_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Produk Pilihan</h2>
          <Link 
            href="/products"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Lihat Semua →
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {products.map((product) => {
            const photoUrl = product.photos?.front || product.photo;
            let parsedPhoto = photoUrl;
            
            // Parse JSON if needed
            if (typeof photoUrl === 'string' && photoUrl.startsWith('{')) {
              try {
                const parsed = JSON.parse(photoUrl);
                parsedPhoto = parsed.front || parsed.back || parsed.detail || photoUrl;
              } catch (e) {
                parsedPhoto = photoUrl;
              }
            }

            return (
              <div
                key={product.product_id}
                onClick={() => router.push(`/product/${product.product_id}`)}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={parsedPhoto}
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
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-1">
                    {product.product_name}
                  </h3>
                  <p className="text-xl font-bold text-gray-800">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2025 ReWear. Platform Fashion Berkelanjutan.</p>
        </div>
      </footer>
    </div>
  );
}