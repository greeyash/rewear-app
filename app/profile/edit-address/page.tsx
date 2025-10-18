"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserAddress {
  user_id: number;
  user_name: string;
  address: string;
  location: string;
}

export default function EditAddressPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    address: '',
    location: ''
  });

  const [errors, setErrors] = useState({
    address: '',
    location: ''
  });

  useEffect(() => {
    fetchUserAddress();
  }, []);

  const fetchUserAddress = async () => {
    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/users/address?user_id=${userId}`);
      const result = await response.json();

      if (result.success) {
        setFormData({
          address: result.user.address || '',
          location: result.user.location || ''
        });
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      console.error('Fetch address error:', err);
      setError('Gagal memuat data alamat');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {
      address: '',
      location: ''
    };

    let isValid = true;

    if (!formData.address.trim()) {
      newErrors.address = 'Alamat lengkap wajib diisi';
      isValid = false;
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Alamat terlalu pendek (minimal 10 karakter)';
      isValid = false;
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Kota/Kabupaten wajib diisi';
      isValid = false;
    } else if (formData.location.trim().length < 3) {
      newErrors.location = 'Nama kota terlalu pendek';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/users/address', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          address: formData.address,
          location: formData.location
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        // Redirect after 1.5 seconds
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        setError(result.error || 'Gagal menyimpan alamat');
      }
    } catch (err: any) {
      console.error('Save address error:', err);
      setError('Gagal menyimpan alamat. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: 'address' | 'location', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2"
          disabled={saving}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <h1 className="text-lg font-medium">Edit Alamat</h1>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mx-4 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <div>
            <div className="font-medium">Berhasil!</div>
            <div className="text-sm">Alamat berhasil diperbarui</div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <div className="font-medium">Error</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Location (Kota/Kabupaten) */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kota/Kabupaten <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="Contoh: Bandung, Jawa Barat"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
              errors.location 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-200 focus:border-[#66bb6a]'
            }`}
            disabled={saving}
          />
          {errors.location && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {errors.location}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Masukkan nama kota atau kabupaten tempat Anda tinggal
          </p>
        </div>

        {/* Full Address */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alamat Lengkap <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Contoh: Jl. Cihampelas No. 123, Kec. Coblong, RT 02/RW 05"
            rows={4}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors resize-none ${
              errors.address 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-200 focus:border-[#66bb6a]'
            }`}
            disabled={saving}
          />
          {errors.address && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {errors.address}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Masukkan alamat lengkap termasuk nama jalan, nomor rumah, RT/RW, dan kecamatan
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-blue-600 mt-0.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Kenapa perlu alamat lengkap?</p>
            <ul className="space-y-1 text-xs">
              <li>• Untuk pengiriman produk yang Anda beli</li>
              <li>• Memudahkan pembeli menemukan lokasi Anda</li>
              <li>• Meningkatkan kepercayaan di marketplace</li>
            </ul>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#66bb6a] text-white font-semibold py-3 rounded-lg hover:bg-[#4caf50] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
              Menyimpan...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              Simpan Alamat
            </>
          )}
        </button>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={() => router.back()}
          disabled={saving}
          className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Batal
        </button>
      </form>
    </div>
  );
}