"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

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
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantityError, setQuantityError] = useState('');

  // Fetch product from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // FIXED: Ambil dari params.id, bukan hardcode
        const productId = params.id;
        
        if (!productId) {
          console.error('Product ID not found in params');
          return;
        }

        console.log('Fetching product with ID:', productId);
        
        const response = await fetch(`/api/products/${productId}`);
        const result = await response.json();
        
        console.log('Fetch result:', result);
        
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
  }, [params.id]); // Add params.id sebagai dependency

  const handleAddToCart = async () => {
    if (!product) return;

    if (quantity > product.quantity) {
      setQuantityError('Stok produk tidak mencukupi');
      return;
    }
    
    setAddingToCart(true);
    setQuantityError('');
    
    try {
      const userId = 1; // TODO: Get from auth session
      
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

  const handleCheckout = async () => {
    if (!product) return;

    if (quantity > product.quantity) {
      setQuantityError('Stok produk tidak mencukupi');
      return;
    }
    
    setQuantityError('');
    
    try {
      const userId = 1; // TODO: Get from auth session
      
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer_id: userId,
          seller_id: product.seller.user_id,
          product_id: product.product_id,
          quantity: quantity,
          total_price: product.price * quantity
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Checkout berhasil! Silakan lanjutkan pembayaran.');
        window.location.reload();
      } else {
        if (result.error.includes('Stok produk tidak mencukupi')) {
          setQuantityError(result.error);
        } else {
          alert('Error: ' + result.error);
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Gagal checkout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">Product not found</div>
          <button 
            onClick={() => window.history.back()}
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
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button onClick={() => window.history.back()} className="p-2 -ml-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <h1 className="text-lg font-medium flex-1 truncate">{product.product_name}</h1>
      </div>

      {/* Image Slider */}
      <div className="bg-white relative">
        <div className="aspect-square relative overflow-hidden">
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
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6"/>
                    </svg>
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                </>
              )}

              {/* Slide Indicators */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        currentSlide === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Photo counter */}
              <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
                {currentSlide + 1} / {images.length}
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            {product.grade && (
              <div className="bg-[#c8e6c9] text-gray-800 px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                Grade {product.grade}
              </div>
            )}
            {product.status === 'sold' && (
              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                TERJUAL
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Price & Title */}
      <div className="bg-white mt-2 p-4">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-[#66bb6a]">
            Rp{product.price.toLocaleString('id-ID')}
          </span>
        </div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          {product.product_name}
        </h2>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          {product.seller.rating && (
            <>
              <span className="flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {product.seller.rating}
              </span>
              <span>•</span>
            </>
          )}
          {product.category && <span>{product.category}</span>}
          {product.size && (
            <>
              <span>•</span>
              <span>Ukuran {product.size}</span>
            </>
          )}
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="bg-white mt-2 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Jumlah</h3>
          <span className="text-sm text-gray-500">
            Stok: <span className="font-medium text-gray-700">{product.quantity}</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setQuantity(Math.max(1, quantity - 1));
              setQuantityError('');
            }}
            className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[#66bb6a] hover:text-[#66bb6a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={quantity <= 1}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => {
              const val = Math.max(1, Math.min(product.quantity, parseInt(e.target.value) || 1));
              setQuantity(val);
              if (val > product.quantity) {
                setQuantityError('Stok produk tidak mencukupi');
              } else {
                setQuantityError('');
              }
            }}
            min={1}
            max={product.quantity}
            className="w-16 text-center border-2 border-gray-200 rounded-lg py-1.5 font-medium focus:outline-none focus:border-[#66bb6a]"
          />
          <button
            onClick={() => {
              if (quantity < product.quantity) {
                setQuantity(quantity + 1);
                setQuantityError('');
              }
            }}
            className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[#66bb6a] hover:text-[#66bb6a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={quantity >= product.quantity}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
        
        {/* Error Message */}
        {quantityError && (
          <div className="mt-2 flex items-start gap-2 text-red-600 text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{quantityError}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <div className="bg-white mt-2 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Deskripsi Produk</h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      )}

      {/* Seller Info */}
      <div className="bg-white mt-2 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Informasi Penjual</h3>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-[#c8e6c9] flex items-center justify-center text-lg font-semibold text-gray-700 flex-shrink-0">
            {product.seller.user_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900">{product.seller.user_name}</div>
            {product.seller.location && (
              <div className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span className="truncate">{product.seller.location}</span>
              </div>
            )}
            {product.seller.address && (
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">{product.seller.address}</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3 shadow-lg">
        <button 
          className="flex-shrink-0 p-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#66bb6a] transition-colors"
          title="Tambah ke Wishlist"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <button 
          onClick={handleAddToCart}
          disabled={addingToCart || product.status === 'sold' || product.quantity <= 0 || quantity > product.quantity}
          className="flex-1 bg-[#c8e6c9] text-gray-800 font-semibold py-3 rounded-lg hover:bg-[#a5d6a7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {addingToCart ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"/>
              Loading...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              Keranjang
            </>
          )}
        </button>
        <button 
          onClick={handleCheckout}
          disabled={product.status === 'sold' || product.quantity <= 0 || quantity > product.quantity}
          className="flex-1 bg-[#66bb6a] text-white font-semibold py-3 rounded-lg hover:bg-[#4caf50] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Beli Sekarang
        </button>
      </div>
    </div>
  );
}