"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [stage, setStage] = useState<'register' | 'complete-profile'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
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

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username tidak boleh kosong');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          user_name: username
        })
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('userId', userId?.toString() || '');
        localStorage.setItem('email', email);
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
            <div className="w-16 h-16 bg-[#66bb6a] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">ReWear</h1>
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
                Akun Anda berhasil dibuat! Silakan masukkan username untuk melengkapi profil.
              </p>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#66bb6a]"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Username akan ditampilkan sebagai nama penjual Anda
                </p>
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
                {loading ? 'Sedang melengkapi...' : 'Lanjutkan'}
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