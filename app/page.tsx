/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */// app/page.tsx

"use client";

import { Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  

  // Hero slides - hanya 2 slide
  const heroSlides = [
    {
      title: "Uniting Threads and Trees for Better Earth",
      subtitle: "Bergabunglah dalam gerakan fashion berkelanjutan"
    },
    {
      title: "Fashion Berkelanjutan Dimulai dari Kamu",
      subtitle: "Setiap pakaian bekas punya cerita baru"
    }
  ];

  useEffect(() => {
    // Set mounted to true
    setIsMounted(true);
    
    // Fetch data
    fetchDonations();
    fetchProducts();
    
    // Load user data from localStorage
    loadUserData();
    
    // Auto slide hero
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadUserData = () => {
    console.log('🚀 loadUserData called');
    console.log('🌐 window defined?', typeof window !== 'undefined');
    
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      const profilePhotoUrl = localStorage.getItem('profilePhotoUrl');
      
      console.log('🔍 Homepage - Checking localStorage:', { 
        userId, 
        userName, 
        profilePhotoUrl 
      });
      
      if (userId && userName) {
        const userData = { 
          user_name: userName,
          profile_photo_url: profilePhotoUrl 
        };
        console.log('✅ Setting user data:', userData);
        setUserData(userData);
        console.log('✅ User data loaded on homepage');
      } else {
        console.log('❌ No user data in localStorage');
        console.log('   - userId:', userId);
        console.log('   - userName:', userName);
      }
    }
  };

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
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
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
    <div className="min-h-screen" style={{ backgroundColor: "#F1F1EF" }}>
          {/* Navigation Bar */}
          <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="px-8 py-4">
              <div className="flex items-center justify-between gap-4">
                {/* Logo */}
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <Image
                    src="/assets/logo-rewearr.png"
                    alt="ReWear Logo"
                    width={140}
                    height={40}
                    className="object-contain"
                  />
                </button>
    
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex justify-center flex-1 max-w-3xl">
                  <div
                    className="relative flex items-center w-full"
                    style={{
                      maxWidth: '1100px',
                      height: '50px',
                      borderRadius: '100px',
                      border: '1px solid #868686',
                      background: '#FFF',
                    }}
                  >
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari produk thrift..."
                      className="w-full h-full rounded-full pl-6 pr-12 text-gray-700 placeholder-gray-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="23"
                        height="24"
                        viewBox="0 0 23 24"
                        fill="none"
                      >
                        <path
                          d="M16 16.4L22 23M10 1C14.9706 1 19 4.93989 19 9.8C19 14.6601 14.9706 18.6 10 18.6C5.02944 18.6 1 14.6601 1 9.8C1 4.93989 5.02944 1 10 1Z"
                          stroke="#2D322D"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                </form>
    
                {/* Right Side Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Cart Button */}
                  <button
                    onClick={() => router.push('/cart')}
                    className="w-[50px] h-[50px] flex items-center justify-center transition-transform hover:scale-105"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="50"
                      height="50"
                      viewBox="0 0 50 50"
                      fill="none"
                    >
                      <circle
                        cx="25"
                        cy="25"
                        r="24.5"
                        fill="url(#paint0_linear_398_102)"
                        fillOpacity="0.9"
                        stroke="white"
                      />
                      <path
                        d="M13 15H14.696C15.1859 15 15.6036 15.3548 15.6829 15.8382L16.1818 18.8824M16.1818 18.8824L17.8161 28.8529C17.9746 29.8197 18.8101 30.5294 19.7898 30.5294H30.392C31.3718 30.5294 32.2072 29.8197 32.3657 28.8529L33.6191 21.2059C33.8187 19.9884 32.8792 18.8824 31.6455 18.8824H16.1818ZM21.2727 33.1176C20.2184 33.1176 19.3636 33.9867 19.3636 35.0588C19.3636 36.1309 20.2184 37 21.2727 37C22.3271 37 23.1818 36.1309 23.1818 35.0588C23.1818 33.9867 22.3271 33.1176 21.2727 33.1176ZM27 35.0588C27 33.9867 27.8547 33.1176 28.9091 33.1176C29.9635 33.1176 30.8182 33.9867 30.8182 35.0588C30.8182 36.1309 29.9635 37 28.9091 37C27.8547 37 27 36.1309 27 35.0588Z"
                        stroke="#2D322D"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient
                          id="paint0_linear_398_102"
                          x1="4.41176"
                          y1="14.7059"
                          x2="46.3235"
                          y2="37.5"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="white" stopOpacity="0.5" />
                          <stop offset="0.5" stopColor="white" />
                          <stop offset="1" stopColor="white" stopOpacity="0.4" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </button>

                  {/* Profile Button - Only show when mounted */}
                  {isMounted && (
                    <>
                      {userData ? (
                        <button
                          onClick={() => router.push('/profile')}
                          className="w-[50px] h-[50px] rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-lg transition-transform hover:scale-105 shadow-md hover:shadow-lg overflow-hidden"
                          title={`Profile: ${userData.user_name}`}
                        >
                          {userData.profile_photo_url ? (
                            <img 
                              src={userData.profile_photo_url} 
                              alt={userData.user_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            userData.user_name?.charAt(0).toUpperCase() || 'U'
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => router.push('/login')}
                          className="px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-full font-semibold transition-colors"
                        >
                          Masuk
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </nav>

      {/* Hero Carousel */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <div
          className="relative rounded-[30px] overflow-hidden shadow-lg mx-auto"
          style={{
            backgroundImage: `url(/assets/hero-bg.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: "1200px",
            height: "526px",
            flexShrink: 0,
            boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.25)",
          }}
        >
          {heroSlides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-700 ${
                idx === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white px-8">
                  <h2 className="text-5xl font-bold mb-4">{slide.title}</h2>
                  <p className="text-xl mb-6">{slide.subtitle}</p>
                  <button
                    onClick={() => window.open("https://sejauh.com/", "_blank")}
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