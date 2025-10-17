"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

interface Product {
  product_id: number;
  product_name: string;
  price: number;
  description: string;
  category: string;
  size: string;
  grade: string;
  status: string;
  quantity: number;
  photos: {
    front?: string;
    back?: string;
    detail?: string;
    label?: string;
    additional?: string;
  };
  seller: {
    user_id: number;
    user_name: string;
    email: string;
    address: string;
    location: string;
    rating: number;
    profile_photo_url?: string;
    name: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantityError, setQuantityError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productId = params.id;
        
        if (!productId) {
          console.error('Product ID not found in params');
          return;
        }

        const response = await fetch(`/api/products/${productId}`);
        const result = await response.json();
        
        if (result.success) {
          setProduct(result.product);
        } else {
          console.error('Product not found:', result.error);
        }
      } catch (error) {
        console.error('Fetch product error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!product) return;

    if (quantity > product.quantity) {
      setQuantityError('Stok produk tidak mencukupi');
      return;
    }
    
    setAddingToCart(true);
    setQuantityError('');
    
    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        alert('Silakan login terlebih dahulu');
        return;
      }
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          product_id: product.product_id,
          quantity: quantity
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Produk berhasil ditambahkan ke keranjang!');
      } else {
        if (result.error.includes('Stok produk tidak mencukupi')) {
          setQuantityError(result.error);
        } else {
          alert('Error: ' + result.error);
        }
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Gagal menambahkan ke keranjang');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleCheckout = () => {
    if (!product) return;

    if (quantity > product.quantity) {
      setQuantityError('Stok produk tidak mencukupi');
      return;
    }
    
    setQuantityError('');
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Silakan login terlebih dahulu');
      return;
    }
    
    router.push(`/checkout?product_id=${product.product_id}&quantity=${quantity}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">Product not found</div>
          <button 
            onClick={() => router.back()}
            className="text-[#66bb6a] hover:underline"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // Handle multiple photos from bucket storage
  const images = Object.values(product.photos).filter(Boolean);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-white">
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

            {/* Cart Button */}
            <button
              onClick={() => router.push('/cart')}
              className="w-[50px] h-[50px] flex items-center justify-center transition-transform hover:scale-105 flex-shrink-0"
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
          </div>
        </div>
      </nav>

      {/* Content - No max-width, full bleed */}
      <div className="px-8 py-8">
        <div className="grid grid-cols-2 gap-8 bg-white rounded-3xl p-10">
          {/* Left Side - Images */}
          <div>
            {/* Main Image */}
            <div className="relative mb-4 rounded-2xl overflow-hidden" style={{ aspectRatio: '1/1' }}>
              {images.length > 0 ? (
                <>
                  <div 
                    className="flex transition-transform duration-300 ease-out h-full"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {images.map((img, idx) => (
                      <div key={idx} className="w-full flex-shrink-0">
                        <img 
                          src={img} 
                          alt={`${product.product_name} - view ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm w-10 h-10 rounded-full shadow-lg hover:bg-white flex items-center justify-center text-2xl"
                      >
                        ‹
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm w-10 h-10 rounded-full shadow-lg hover:bg-white flex items-center justify-center text-2xl"
                      >
                        ›
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`rounded-xl overflow-hidden border-2 transition-all ${
                      currentSlide === idx ? 'border-[#a855f7]' : 'border-transparent'
                    }`}
                    style={{ aspectRatio: '1/1' }}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Product Info */}
          <div className="flex flex-col">
            {/* Grade Badge - Top Left */}
            {product.grade && (
              <div className="flex flex-col mb-4">
                <div
                  style={{
                    borderRadius: "21px",
                    background: "linear-gradient(84deg, #9C83F3 0.85%, #BBADEB 88.95%)",
                    width: "130.638px",
                    height: "37.746px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                >
                  Grade {product.grade}
                </div>
              </div>
            )}

            {/* Category Label */}
            <div
              style={{
                color: "#868686",
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: "22px",
                fontStyle: "normal",
                fontWeight: 500,
                lineHeight: "normal",
                letterSpacing: "-0.43px",
              }}
              className="mb-2"
            >
              {product.category || "Uncategorized"}
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.product_name}</h1>

            {/* Size Badge */}
            {product.size && (
              <div className="mb-4">
                <span className="bg-black text-white px-3 py-1 rounded-md text-sm font-medium">
                  Ukuran {product.size}
                </span>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="mb-6 leading-relaxed">
                <p
                  style={{
                    color: "#868686",
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    fontSize: "20px",
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "normal",
                    letterSpacing: "-0.43px",
                  }}
                >
                  {product.description}
                </p>
              </div>
            )}

            {/* Price */}
            <div className="mb-8">
              <h1
                style={{
                  color: "#2D322D",
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: "40px",
                  fontStyle: "normal",
                  fontWeight: 800,
                  lineHeight: "normal",
                  letterSpacing: "-0.43px",
                }}
              >
                Rp{Number(product.price).toLocaleString("id-ID")},00
              </h1>
            </div>

            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || product.status === 'sold' || product.quantity <= 0}
                style={{
                  width: "250px",
                  height: "45px",
                  flexShrink: 0,
                  borderRadius: "30px",
                  background: "#2D322D",
                  color: "#FFF",
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: "16px",
                  fontStyle: "normal",
                  fontWeight: 600,
                  lineHeight: "normal",
                  letterSpacing: "-0.43px",
                  textAlign: "center",
                  transition: "background 0.2s",
                }}
                className="hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToCart ? "Loading..." : "Tambahkan ke Keranjang"}
              </button>

              <button
                onClick={handleCheckout}
                disabled={product.status === 'sold' || product.quantity <= 0}
                style={{
                  width: "250px",
                  height: "45px",
                  flexShrink: 0,
                  borderRadius: "30px",
                  background: "#C7E0A5",
                  color: "#2D322D",
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: "16px",
                  fontStyle: "normal",
                  fontWeight: 600,
                  lineHeight: "normal",
                  letterSpacing: "-0.43px",
                  textAlign: "center",
                  transition: "background 0.2s",
                }}
                className="hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Beli Sekarang
              </button>
            </div>

            {/* Seller Card */}
            <div
              className="rounded-[24px] flex-shrink-0"
              style={{
                background: "#D9D9D9",
                width: "100%",
                maxWidth: "584px",
                minHeight: "193px",
              }}
            >
              <div className="flex items-center gap-4 p-6">
                {/* Profil */}
                <div
                  className="flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{
                    width: "69px",
                    height: "69px",
                    borderRadius: "105px",
                    border: "1px solid #2D322D",
                    background: "#FFF",
                  }}
                >
                  <img
                    src={
                      product.seller.profile_photo_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(product.seller.user_name)}&background=random`
                    }
                    alt={product.seller.user_name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                {/* Info Seller */}
                <div className="flex flex-col flex-1">
                  <div
                    style={{
                      color: "#2D322D",
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontSize: "24px",
                      fontStyle: "normal",
                      fontWeight: 600,
                      lineHeight: "normal",
                      letterSpacing: "-0.43px",
                    }}
                  >
                    {product.seller.name || product.seller.user_name}
                  </div>

                  <div
                    style={{
                      color: "#868686",
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontSize: "16px",
                      fontStyle: "normal",
                      fontWeight: 500,
                      lineHeight: "normal",
                      letterSpacing: "-0.43px",
                    }}
                  >
                    @{product.seller.user_name}
                  </div>

                  {/* Rating */}
                  <div className="mt-2">
                    {product.seller.rating ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-yellow-500 text-sm">
                          {"★".repeat(Math.floor(product.seller.rating))}
                          {"☆".repeat(5 - Math.floor(product.seller.rating))}
                        </div>
                        <span
                          style={{
                            color: "#868686",
                            fontFamily: '"Plus Jakarta Sans", sans-serif',
                            fontSize: "14px",
                          }}
                        >
                          {Number(product.seller.rating).toFixed(1)}
                        </span>
                      </div>
                    ) : (
                      <div
                        style={{
                          color: "#868686",
                          fontFamily: '"Plus Jakarta Sans", sans-serif',
                          fontSize: "14px",
                        }}
                      >
                        Belum ada rating
                      </div>
                    )}
                  </div>

                  {/* Lokasi */}
                  <div
                    className="mt-2"
                    style={{
                      color: "#868686",
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontSize: "14px",
                    }}
                  >
                    {product.seller.location || "Jakarta"}
                  </div>
                </div>

                {/* Tombol Chat */}
                <button
                  className="flex items-center justify-center hover:opacity-80"
                  style={{
                    width: "23px",
                    height: "20px",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="22"
                    viewBox="0 0 25 22"
                    fill="none"
                  >
                    <path
                      d="M12.5 20.104C18.8513 20.104 24 15.8274 24 10.552C24 5.27658 18.8513 1 12.5 1C6.14873 1 1 5.27658 1 10.552C1 13.3053 2.40245 15.7865 4.64635 17.5297C4.7601 17.618 4.81795 17.761 4.79353 17.9027L4.33674 20.5522C4.28109 20.875 4.63206 21.1134 4.91313 20.9437L7.56692 19.3416C7.66794 19.2806 7.79136 19.2698 7.90234 19.3101C9.31039 19.8207 10.8654 20.104 12.5 20.104Z"
                      stroke="#2D322D"
                      strokeWidth="1.5"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Produk Terkait */}
      <div className="px-8 pb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Produk Terkait</h2>
        <div className="grid grid-cols-4 gap-6">
          {/* Placeholder for related products */}
        </div>
      </div>
    </div>
  );
}