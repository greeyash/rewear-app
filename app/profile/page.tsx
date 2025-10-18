"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"]
});

export default function ProfilePage() {
  const router = useRouter();
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'donations'>('products');
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      router.push('/login');
      return;
    }
    
    setCurrentUserId(userId);
    fetchUserData(userId);
    fetchProducts(userId);
    fetchDonations(userId);
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/profile?user_id=${userId}`);
      const result = await response.json();
      
      if (result.success) {
        setUserData(result.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchProducts = async (userId: string) => {
    try {
      const response = await fetch(`/api/products?user_id=${userId}`);
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.products || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const fetchDonations = async (userId: string) => {
    try {
      const response = await fetch(`/api/donations/list?creator_id=${userId}`);
      const result = await response.json();
      
      if (result.success) {
        setDonations(result.donations || []);
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    // Clear any other user-related data you might have stored
    
    // Redirect to login page
    router.push('/login');
  };

  if (loading || !userData) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${plusJakarta.className}`}>
        <div className="text-gray-500">Memuat...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 pb-8 ${plusJakarta.className}`}>
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Keluar dari Akun?</h3>
            <p className="text-gray-600 mb-6">Apakah Anda yakin ingin keluar dari akun Anda?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Profile Card */}
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 px-8 pt-8 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            {/* Profile Photo & Info */}
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-gray-300 overflow-hidden shadow-lg flex items-center justify-center">
                {userData.profile_photo_url ? (
                  <img src={userData.profile_photo_url} alt={userData.user_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-3xl font-bold">
                    {userData.user_name?.charAt(0).toUpperCase() || 'M'}
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">{userData.user_name}</h1>
                <p className="text-gray-600 text-sm mb-1">{userData.email}</p>
                <div className="flex items-center gap-1 text-gray-700">
                  <span className="text-sm">{userData.location || 'Jakarta'}</span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="px-4 py-2 bg-white hover:bg-red-50 text-red-600 rounded-xl font-semibold transition-colors shadow-md border border-red-200"
            >
              Keluar
            </button>
          </div>

          {/* Action Buttons */}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8">
        {/* Tabs */}
        <div className="flex gap-4 mt-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'products'
                ? 'text-gray-800'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Produk Saya
            {activeTab === 'products' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('donations')}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'donations'
                ? 'text-gray-800'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Donasi Saya
            {activeTab === 'donations' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800"></div>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'products' && (
            <div>
              {products.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-8xl mb-4"></div>
                  <p className="text-xl font-semibold text-gray-800 mb-2">Belum ada produk</p>
                  <p className="text-gray-600 mb-6">Mulai upload produk thrift kamu</p>
                  <button
                    onClick={() => router.push('/product/upload')}
                    className="px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900"
                  >
                    Tambah Produk
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-6">
                  {products.map((product) => {
                    let photoUrl = '/placeholder.jpg';
                    try {
                      const photos = typeof product.photo === 'string' 
                        ? JSON.parse(product.photo) 
                        : product.photo;
                      photoUrl = photos?.front || photoUrl;
                    } catch (e) {
                      console.error('Error parsing photo:', e);
                    }

                    return (
                      <div 
                        key={product.product_id} 
                        onClick={() => router.push(`/products/${product.product_id}`)}
                        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer"
                      >
                        <div className="relative aspect-square bg-gray-100">
                          <img src={photoUrl} alt={product.product_name} className="w-full h-full object-cover" />
                          
                          <div className="absolute top-3 left-3 flex gap-2">
                            <span className={`text-xs px-3 py-1 rounded-full text-white font-semibold ${
                              product.status === 'sold' ? 'bg-red-500' : 'bg-green-500'
                            }`}>
                              {product.status === 'sold' ? 'Terjual' : 'Tersedia'}
                            </span>
                            {product.grade && (
                              <span className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                                Grade {product.grade}
                              </span>
                            )}
                          </div>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Show options menu
                            }}
                            className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full p-2 hover:bg-white"
                          >
                            ⋮
                          </button>
                        </div>

                        <div className="p-4">
                          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">
                            {product.product_name}
                          </h3>
                          <p className="text-gray-900 font-bold text-lg">
                            Rp{product.price?.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'donations' && (
            <div>
              {donations.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-8xl mb-4"></div>
                  <p className="text-xl font-semibold text-gray-800 mb-2">Belum ada donasi</p>
                  <p className="text-gray-600 mb-6">Mulai buat kampanye donasi untuk membantu sesama</p>
                  <button
                    onClick={() => router.push('/donations/create')}
                    className="px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900"
                  >
                    Upload Donasi
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  {donations.map((donation) => {
                    const progress = Math.min(
                      ((donation.current_quantity || 0) / donation.target_quantity) * 100,
                      100
                    );

                    return (
                      <div 
                        key={donation.donation_id} 
                        onClick={() => router.push(`/donations/${donation.donation_id}`)}
                        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer"
                      >
                        <div className="relative aspect-video bg-gray-100">
                          <img 
                            src={donation.campaign_photo_url || '/placeholder.jpg'} 
                            alt={donation.donation_target} 
                            className="w-full h-full object-cover" 
                          />
                          
                          <div className="absolute top-3 left-3">
                            <span className={`text-xs px-3 py-1 rounded-full text-white font-semibold ${
                              donation.donation_status === 'completed' ? 'bg-green-500' : 
                              donation.donation_status === 'reported' ? 'bg-blue-500' : 
                              'bg-yellow-500'
                            }`}>
                              {donation.donation_status === 'completed' ? 'Selesai' :
                               donation.donation_status === 'reported' ? 'Dilaporkan' :
                               'Berlangsung'}
                            </span>
                          </div>
                        </div>

                        <div className="p-4">
                          <h3 className="font-semibold text-gray-800 mb-3 line-clamp-2">
                            {donation.organization?.organization_name || donation.donation_target}
                          </h3>
                          
                          <div className="mb-3">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                              <span>{donation.current_quantity || 0} terkumpul</span>
                              <span>Target: {donation.target_quantity}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-purple-500 h-2.5 rounded-full transition-all" 
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {donation.donation_deadline && (
                            <p className="text-xs text-gray-500">
                              Deadline: {new Date(donation.donation_deadline).toLocaleDateString('id-ID')}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}