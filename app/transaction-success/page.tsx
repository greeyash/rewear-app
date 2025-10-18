/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface TransactionData {
  total_items: number;
  total_weight: number;
  co2_saved: number;
  textile_saved: number;
}

export default function TransactionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<TransactionData>({
    total_items: 1,
    total_weight: 0.8,
    co2_saved: 2.4,
    textile_saved: 0.8
  });

  useEffect(() => {
    // Calculate impact based on number of items from checkout
    const itemsParam = searchParams.get('items');
    const quantityParam = searchParams.get('quantity');
    
    let totalItems = 1;
    if (itemsParam) {
      totalItems = itemsParam.split(',').length;
    } else if (quantityParam) {
      totalItems = parseInt(quantityParam) || 1;
    }

    // Estimasi per pakaian:
    // - Berat rata-rata: 0.8 kg
    // - CO2 saved: 2.4 kg (dari produksi baju baru)
    // - Textile saved: sama dengan berat
    const weight = totalItems * 0.8;
    const co2 = totalItems * 2.4;
    const textile = totalItems * 0.8;

    setData({
      total_items: totalItems,
      total_weight: weight,
      co2_saved: co2,
      textile_saved: textile
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Success Icon with Animation */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Outer circle animation */}
            <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-75"></div>
            
            {/* Middle circle */}
            <div className="relative w-32 h-32 bg-green-300 rounded-full flex items-center justify-center">
              {/* Inner circle */}
              <div className="w-24 h-24 bg-[#66bb6a] rounded-full flex items-center justify-center">
                {/* Checkmark */}
                <svg 
                  width="48" 
                  height="48" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-[scale-in_0.3s_ease-out]"
                >
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Transaksi Berhasil
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Terimakasih telah berkontribusi melalui ReWear
        </p>

        {/* Impact Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
         <div
            style={{
                background: "linear-gradient(90deg, #9C83F3 0%, #BBADEB 100%)",
            }}
            className="px-6 py-4 rounded-xl"
            >
            <h2 className="text-white font-semibold text-lg text-center">
              Dampak dari Aksimu
            </h2>
          </div>
          
          <div className="px-6 py-6 space-y-4">
            <div className="text-center pb-4 border-b border-gray-100">
              <p className="text-gray-600 text-sm mb-1">
                {data.total_items} pakaian terselamatkan!
              </p>
            </div>

            {/* CO2 Impact */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Emisi karbon berkurang:</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Setara dengan tidak mengendarai mobil ~{Math.round(data.co2_saved * 4)} km
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-blue-600">
                  {data.co2_saved.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">kg CO₂</p>
              </div>
            </div>

            {/* Textile Saved */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8z"/>
                    <path d="M7.5 4.21l4.5 2.6 4.5-2.6"/>
                    <path d="M7.5 19.79V14.6L3 12"/>
                    <path d="M21 12l-4.5 2.6v5.19"/>
                    <path d="M3.27 6.96L12 12.01l8.73-5.05"/>
                    <path d="M12 22.08V12"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Limbah tekstil diselamatkan:</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Mengurangi sampah TPA
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-purple-600">
                  {data.textile_saved.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">kg</p>
              </div>
            </div>

            {/* Water Saved */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Air yang dihemat:</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Setara dengan {Math.round(data.total_items * 2700 / 8)} kali mandi
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-cyan-600">
                  {(data.total_items * 2.7).toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">ribu L</p>
              </div>
            </div>
          </div>

          {/* Fun Fact */}
          <div className="bg-green-50 px-6 py-4 border-t border-green-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-green-800 mb-1">
                  💡 Tahukah kamu?
                </p>
                <p className="text-xs text-green-700">
                  Membeli {data.total_items} pakaian bekas mengurangi jejak karbon setara dengan menanam {Math.round(data.co2_saved / 0.5)} pohon!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/orders')}
            className="w-full bg-[#66bb6a] text-white font-semibold py-4 rounded-full hover:bg-[#4caf50] transition-colors shadow-lg"
          >
            Lihat Dashboard Dampak
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full bg-white text-gray-700 font-semibold py-4 rounded-full hover:bg-gray-50 transition-colors shadow-md"
          >
            Kembali ke Beranda
          </button>
        </div>

        {/* Share Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">
            Bagikan dampak positifmu!
          </p>
          <div className="flex justify-center gap-3">
            <button className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            <button className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DA1F2">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </button>
            <button className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}