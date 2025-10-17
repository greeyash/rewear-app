"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

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

  const images = Object.values(product.photos).filter(Boolean);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-white">
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
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm w-10 h-10 rounded-full shadow-lg hover:bg-white flex items-center justify-center"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15 18l-6-6 6-6"/>
                        </svg>
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm w-10 h-10 rounded-full shadow-lg hover:bg-white flex items-center justify-center"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
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
                    <div className="flex flex-col, mb-4">
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
            <div className="text-gray-600 mb-2 text-sm">{product.category}</div>

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
                  fontFamily: "Plus Jakarta Sans",
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
            <div className="text-4xl font-bold text-gray-900  mb-8">
              Rp{product.price.toLocaleString('id-ID')}
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
            > </h1>
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
            <div className="bg-[#f3f4f6] rounded-2xl p-5 mt-auto">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${product.seller.user_name}&background=random`} 
                    alt={product.seller.user_name}
                    className="w-full h-full rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">{product.seller.user_name}</div>
                  {product.seller.rating && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center text-yellow-500">
                        {'★'.repeat(Math.floor(product.seller.rating))}
                        {'☆'.repeat(5 - Math.floor(product.seller.rating))}
                      </div>
                      <span className="text-gray-600">
                        {product.seller.rating.toFixed(1)} (70 reviews)
                      </span>
                    </div>
                  )}
                  <div className="text-gray-500 text-xs mt-1">
                     {product.seller.location || 'Jakarta'}
                  </div>
                </div>
                <button className="w-10 h-10 rounded-full hover:bg-gray-200 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
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