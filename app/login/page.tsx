"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Cek apakah email terdaftar
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (result.exists) {
        // Email sudah terdaftar - cek password
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const loginResult = await loginResponse.json();

        if (loginResult.success) {
          // PENTING: Simpan user ID sebagai string
          localStorage.setItem('userId', String(loginResult.user_id));
          localStorage.setItem('email', loginResult.email);
          
          console.log('Login success! User ID:', loginResult.user_id);
          console.log('Saved to localStorage:', localStorage.getItem('userId'));
          
          // Redirect ke home
          router.push('/home');
        } else {
          setError(loginResult.error || 'Password salah');
        }
      } else {
        // Email belum terdaftar - redirect ke sign up
        router.push(`/signup?email=${encodeURIComponent(email)}`);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Terjadi kesalahan saat login');
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
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="Masukkan password"
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

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#66bb6a] text-white font-semibold py-3 rounded-lg hover:bg-[#4caf50] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Sedang masuk...' : 'Masuk'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-600 text-sm mt-6">
            Belum punya akun?{' '}
            <button
              onClick={() => router.push('/signup')}
              className="text-[#66bb6a] font-semibold hover:underline"
            >
              Daftar di sini
            </button>
          </p>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan kami</p>
        </div>
      </div>
    </div>
  );
}