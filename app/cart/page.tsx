"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CartItem {
  cart_item_id: number;
  quantity: number;
  products: {
    product_id: number;
    product_name: string;
    price: number;
    grade: string;
    status: string;
    category: string;
    size: string;
    quantity: number;
    photos: {
      front?: string;
    };
  };
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const userId = localStorage.getItem('userId') || '1';
      const response = await fetch(`/api/cart?user_id=${userId}`);
      const result = await response.json();

      if (result.success) {
        setItems(result.items || []);
      } else {
        console.error('❌ API returned error:', result.error);
      }
    } catch (error) {
      console.error('💥 Fetch cart error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (cartItemId: number) => {
    setSelectedItems(prev =>
      prev.includes(cartItemId)
        ? prev.filter(id => id !== cartItemId)
        : [...prev, cartItemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.cart_item_id));
    }
  };

  const handleUpdateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity <= 0) return;

    try {
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart_item_id: cartItemId,
          quantity: newQuantity
        })
      });

      const result = await response.json();
      if (result.success) {
        fetchCart();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Update quantity error:', error);
    }
  };

  const handleDeleteItem = async (cartItemId: number) => {
    try {
      const response = await fetch(`/api/cart?cart_item_id=${cartItemId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        fetchCart();
        setSelectedItems(prev => prev.filter(id => id !== cartItemId));
      }
    } catch (error) {
      console.error('Delete item error:', error);
    }
  };

  const calculateTotal = () => {
    return items
      .filter(item => selectedItems.includes(item.cart_item_id))
      .reduce((sum, item) => sum + item.products.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert('Pilih item untuk checkout');
      return;
    }
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 px-4 py-4 flex items-center gap-3 shadow-sm">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold flex-1">Keranjang</h1>
      </div>

      {items.length === 0 ? (
        // Empty Cart
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-6">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Keranjang Kosong</h2>
          <p className="text-gray-600 text-center mb-6">Belum ada produk di keranjang Anda</p>
          <button
            onClick={() => router.push('/home')}
            className="bg-[#66bb6a] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#4caf50] transition-colors"
          >
            Mulai Belanja
          </button>
        </div>
      ) : (
        <>
          {/* Select All */}
          <div className="bg-white px-4 py-3 flex items-center gap-3 mt-2">
            <button onClick={handleSelectAll} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  selectedItems.length === items.length
                    ? 'bg-[#66bb6a] border-[#66bb6a]'
                    : 'border-gray-300'
                }`}
              >
                {selectedItems.length === items.length && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700">Pilih Semua</span>
            </button>
          </div>

          {/* Cart Items */}
          <div className="px-4 py-2 space-y-2">
            {items.map((item) => (
              <div key={item.cart_item_id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex gap-3">
                  {/* Checkbox */}
                  <button onClick={() => handleSelectItem(item.cart_item_id)} className="flex-shrink-0 pt-1">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedItems.includes(item.cart_item_id)
                          ? 'bg-[#66bb6a] border-[#66bb6a]'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedItems.includes(item.cart_item_id) && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </div>
                  </button>

                  {/* Product Image */}
                  <div
                    onClick={() => router.push(`/product/${item.products.product_id}`)}
                    className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                  >
                    {item.products.photos?.front ? (
                      <img
                        src={item.products.photos.front}
                        alt={item.products.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3
                      onClick={() => router.push(`/product/${item.products.product_id}`)}
                      className="font-medium text-gray-900 mb-1 line-clamp-2 cursor-pointer"
                    >
                      {item.products.product_name}
                    </h3>

                    <div className="flex items-center gap-2 mb-2">
                      {item.products.grade && (
                        <span className="text-xs bg-[#c8e6c9] text-gray-800 px-2 py-0.5 rounded-full font-medium">
                          Grade {item.products.grade}
                        </span>
                      )}
                      {item.products.size && <span className="text-xs text-gray-600">{item.products.size}</span>}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-[#66bb6a]">
                        Rp{item.products.price.toLocaleString('id-ID')}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 rounded-full border-2 border-gray-300 flex items-center justify-center disabled:opacity-30"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity + 1)}
                          disabled={item.quantity >= item.products.quantity}
                          className="w-7 h-7 rounded-full border-2 border-gray-300 flex items-center justify-center disabled:opacity-30"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteItem(item.cart_item_id)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Bottom Checkout Bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-600">Total ({selectedItems.length} item)</p>
              <p className="text-2xl font-bold text-gray-900">Rp{calculateTotal().toLocaleString('id-ID')}</p>
            </div>
            <button
              onClick={handleCheckout}
              disabled={selectedItems.length === 0}
              className="bg-[#66bb6a] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#4caf50] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
