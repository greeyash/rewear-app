"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';


export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [stage, setStage] = useState<'register' | 'complete-profile'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const emailFromParams = searchParams.get('email');
    if (emailFromParams) {
      setEmail(decodeURIComponent(emailFromParams));
    }
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Email dan password diperlukan');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          user_name: email.split('@')[0] // Temporary name
        })
      });

      const result = await response.json();

      if (result.success) {
        setUserId(result.user_id);
        setStage('complete-profile');
      } else {
        setError(result.error || 'Gagal mendaftar');
      }
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi file
      if (!file.type.startsWith('image/')) {
        setError('File harus berupa gambar');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError('Ukuran file maksimal 5MB');
        return;
      }

      setProfilePhoto(file);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username tidak boleh kosong');
      return;
    }

    if (!name.trim()) {
      setError('Nama tidak boleh kosong');
      return;
    }

    if(!location.trim()){
      setError('Lokasi tidak boleh kosong');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('user_id', userId?.toString() || '');
      formData.append('user_name', username.trim());
      formData.append('name', name.trim());
      
      if (address.trim()) {
        formData.append('address', address.trim());
      }
      
      if (location.trim()) {
        formData.append('location', location.trim());
      }
      
      if (profilePhoto) {
        formData.append('profile_photo', profilePhoto);
      }

      const response = await fetch('/api/auth/update-profile', {
        method: 'PATCH',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('userId', userId?.toString() || '');
        localStorage.setItem('email', email);
        localStorage.setItem('userName', username);
        router.push('/home');
      } else {
        setError(result.error || 'Gagal mengupdate profil');
      }
    } catch (err: any) {
      console.error('Update profile error:', err);
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <div className=" flex items-center justify-center mx-auto mb-4">
                <Image
                 src="/assets/logo-rewearr.png"
                  alt="ReWear Logo"
                 width={140}
                  height={40}
                  className="object-contain"
                                          />
                        </div>
                          <p className="text-gray-600 text-sm mt-1">Beli pakaian bekas berkualitas</p>
            <p className="text-gray-600 text-sm mt-1">
              {stage === 'register' ? 'Daftar akun baru' : 'Lengkapi profil Anda'}
            </p>
          </div>

          {/* Stage: Register */}
          {stage === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@email.com"
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#66bb6a]"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#66bb6a]"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#66bb6a]"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#66bb6a] text-white font-semibold py-3 rounded-lg hover:bg-[#4caf50] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? 'Sedang mendaftar...' : 'Daftar'}
              </button>
            </form>
          )}

          {/* Stage: Complete Profile */}
          {stage === 'complete-profile' && (
            <form onSubmit={handleCompleteProfile} className="space-y-4">
              <p className="text-gray-600 text-sm text-center mb-6">
                Akun Anda berhasil dibuat! Lengkapi profil untuk melanjutkan.
              </p>

              {/* Profile Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto Profil (Opsional)
                </label>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-3">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    )}
                  </div>
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors">
                    Pilih Foto
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Maksimal 5MB (JPG, PNG)</p>
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#66bb6a]"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Username akan ditampilkan sebagai nama penjual Anda
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#66bb6a]"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat (Opsional)
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Contoh No. 123"
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#66bb6a] resize-none"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lokasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Jakarta, Indonesia"
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#66bb6a]"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Complete Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#66bb6a] text-white font-semibold py-3 rounded-lg hover:bg-[#4caf50] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? 'Sedang melengkapi...' : 'Selesai'}
              </button>
            </form>
          )}

          {/* Footer */}
          {stage === 'register' && (
            <p className="text-center text-gray-600 text-sm mt-6">
              Sudah punya akun?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-[#66bb6a] font-semibold hover:underline"
              >
                Masuk di sini
              </button>
            </p>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan kami</p>
        </div>
      </div>
    </div>
  );
}