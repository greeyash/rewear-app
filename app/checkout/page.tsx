"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface CheckoutItem {
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  grade?: string;
  size?: string;
  photo?: string;
  seller_id: number;
}

interface UserAddress {
  user_name: string;
  address: string;
  location: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [userAddress, setUserAddress] = useState<UserAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('transfer');

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert('Silakan login terlebih dahulu');
        router.push('/login');
        return;
      }

      // Get user address
      const userResponse = await fetch(`/api/users/${userId}`);
      const userData = await userResponse.json();
      if (userData.success) {
        setUserAddress({
          user_name: userData.user.user_name,
          address: userData.user.address || 'Belum ada alamat',
          location: userData.user.location || ''
        });
      }

      // Check if direct buy from product detail
      const productId = searchParams.get('product_id');
      const quantity = searchParams.get('quantity');

      if (productId && quantity) {
        // Direct buy from product detail
        const response = await fetch(`/api/products/${productId}`);
        const result = await response.json();
        
        if (result.success) {
          const product = result.product;
          setItems([{
            product_id: product.product_id,
            product_name: product.product_name,
            price: product.price,
            quantity: parseInt(quantity),
            grade: product.grade,
            size: product.size,
            photo: product.photos?.front || null,
            seller_id: product.seller.user_id
          }]);
        }
      } else {
        // Checkout from cart
        const cartItemIds = searchParams.get('items');
        if (!cartItemIds) {
          alert('Tidak ada item untuk checkout');
          router.back();
          return;
        }

        const response = await fetch(`/api/cart?user_id=${userId}`);
        const result = await response.json();
        
        if (result.success) {
          const selectedIds = cartItemIds.split(',').map(id => parseInt(id));
          const selectedItems = result.items
            .filter((item: any) => selectedIds.includes(item.cart_item_id))
            .map((item: any) => ({
              cart_item_id: item.cart_item_id,
              product_id: item.products.product_id,
              product_name: item.products.product_name,
              price: item.products.price,
              quantity: item.quantity,
              grade: item.products.grade,
              size: item.products.size,
              photo: item.products.photos?.front || null,
              seller_id: item.products.user_id
            }));
          
          setItems(selectedItems);
        }
      }
    } catch (error) {
      console.error('Load checkout data error:', error);
      alert('Gagal memuat data checkout');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (!userAddress?.address || userAddress.address === 'Belum ada alamat') {
      alert('Silakan lengkapi alamat pengiriman terlebih dahulu');
      return;
    }

    setProcessing(true);

    try {
      const userId = localStorage.getItem('userId');
      
      // Create transactions for each item
      const transactions = items.map(item => ({
        buyer_id: parseInt(userId!),
        seller_id: item.seller_id,
        product_id: item.product_id,
        quantity: item.quantity,
        total_price: item.price * item.quantity
      }));

      // Process all transactions
      const results = await Promise.all(
        transactions.map(transaction =>
          fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction)
          }).then(res => res.json())
        )
      );

      const allSuccess = results.every(r => r.success);

      if (allSuccess) {
        // Remove items from cart if checkout from cart
        const cartItemIds = searchParams.get('items');
        if (cartItemIds) {
          const ids = cartItemIds.split(',');
          await Promise.all(
            ids.map(id =>
              fetch(`/api/cart?cart_item_id=${id}`, { method: 'DELETE' })
            )
          );
        }

        // Redirect to success page dengan data items
        const itemsCount = items.length;
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        router.push(`/transaction-success?items=${itemsCount}&quantity=${totalQuantity}`);
      } else {
        const failedResults = results.filter(r => !r.success);
        console.error('Failed transactions:', failedResults);
        alert('Beberapa pesanan gagal diproses: ' + failedResults.map(r => r.error).join(', '));
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Gagal memproses checkout');
    } finally {
      setProcessing(false);
    }
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
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <h1 className="text-xl font-semibold">Checkout</h1>
      </div>

      {/* Shipping Address */}
      <div className="bg-white mt-2 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Alamat Pengiriman</h2>
          <button 
            onClick={() => router.push('/profile/edit-address')}
            className="text-sm text-[#66bb6a] font-medium"
          >
            Ubah
          </button>
        </div>
        
        {userAddress ? (
          <div>
            <div className="font-medium text-gray-900 mb-1">{userAddress.user_name}</div>
            <div className="text-sm text-gray-600 mb-1">{userAddress.address}</div>
            {userAddress.location && (
              <div className="text-sm text-gray-500">{userAddress.location}</div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500">Loading...</div>
        )}
      </div>

      {/* Product List */}
      <div className="bg-white mt-2 p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Produk Dipesan</h2>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
              {/* Product Image */}
              <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                {item.photo ? (
                  <img
                    src={item.photo}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <path d="M21 15l-5-5L5 21"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                  {item.product_name}
                </h3>
                
                <div className="flex items-center gap-2 mb-2">
                  {item.grade && (
                    <span className="text-xs bg-[#c8e6c9] text-gray-800 px-2 py-0.5 rounded-full">
                      Grade {item.grade}
                    </span>
                  )}
                  {item.size && (
                    <span className="text-xs text-gray-600">{item.size}</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#66bb6a]">
                    Rp{item.price.toLocaleString('id-ID')}
                  </span>
                  <span className="text-sm text-gray-600">
                    x{item.quantity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white mt-2 p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Metode Pembayaran</h2>
        <div className="space-y-2">
          <button
            onClick={() => setPaymentMethod('transfer')}
            className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
              paymentMethod === 'transfer'
                ? 'border-[#66bb6a] bg-green-50'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Transfer Bank</div>
                <div className="text-xs text-gray-500">BCA, Mandiri, BNI</div>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              paymentMethod === 'transfer'
                ? 'border-[#66bb6a] bg-[#66bb6a]'
                : 'border-gray-300'
            }`}>
              {paymentMethod === 'transfer' && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              )}
            </div>
          </button>

          <button
            onClick={() => setPaymentMethod('cod')}
            className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
              paymentMethod === 'cod'
                ? 'border-[#66bb6a] bg-green-50'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">COD (Cash on Delivery)</div>
                <div className="text-xs text-gray-500">Bayar saat terima</div>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              paymentMethod === 'cod'
                ? 'border-[#66bb6a] bg-[#66bb6a]'
                : 'border-gray-300'
            }`}>
              {paymentMethod === 'cod' && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white mt-2 p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Ringkasan Belanja</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Harga ({items.length} item)</span>
            <span className="font-medium">Rp{calculateTotal().toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Biaya Pengiriman</span>
            <span className="font-medium text-gray-900">Gratis</span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">Total Pembayaran</span>
              <span className="text-xl font-bold text-[#66bb6a]">
                Rp{calculateTotal().toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-600">Total Pembayaran</p>
            <p className="text-xl font-bold text-gray-900">
              Rp{calculateTotal().toLocaleString('id-ID')}
            </p>
          </div>
          <button
            onClick={handleCheckout}
            disabled={processing}
            className="bg-[#66bb6a] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#4caf50] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {processing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                Memproses...
              </>
            ) : (
              'Buat Pesanan'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}