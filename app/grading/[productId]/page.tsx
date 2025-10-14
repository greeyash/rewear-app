"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Product {
  product_id: number;
  product_name: string;
  grade: string;
  photos: {
    front?: string;
  };
}

export default function GradingPage() {
  const router = useRouter();
  const params = useParams();
  const [stage, setStage] = useState<'loading' | 'result'>('loading');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('Menganalisis foto tampak depan...');
  const [grade, setGrade] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [reason, setReason] = useState('');
  const [productImage, setProductImage] = useState('');
  const [product, setProduct] = useState<Product | null>(null);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productId = params.productId;
        
        if (!productId) return;

        const response = await fetch(`/api/products/${productId}`);
        const result = await response.json();

        if (result.success && result.product) {
          setProduct(result.product);
          if (result.product.photos?.front) {
            setProductImage(result.product.photos.front);
          }
        }
      } catch (error) {
        console.error('Fetch product error:', error);
      }
    };

    fetchProduct();
  }, [params.productId]);

  // Simulasi proses grading
  useEffect(() => {
    const progressSteps = [
      { percent: 20, text: 'Menganalisis foto tampak depan...' },
      { percent: 40, text: 'Memeriksa foto tampak belakang...' },
      { percent: 60, text: 'Mengevaluasi tekstur kain...' },
      { percent: 80, text: 'Mengidentifikasi cacat atau noda...' },
      { percent: 100, text: 'Menentukan grade akhir...' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < progressSteps.length) {
        setProgress(progressSteps[currentStep].percent);
        setProgressText(progressSteps[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setStage('result');
          if (product?.grade) {
            setGrade(product.grade as 'A' | 'B' | 'C' | 'D');
            setReason(getReasonByGrade(product.grade));
          }
        }, 500);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [product]);

  const getReasonByGrade = (gradeValue: string): string => {
    switch (gradeValue) {
      case 'A':
        return 'Wah, bajumu nyaris seperti baru keluar dari toko! AI mendeteksi tidak ada noda, benang longgar, atau tanda pemakaian berarti.';
      case 'B':
        return 'Kondisi sangat baik! Pakaian ini hanya memiliki tanda pemakaian minimal dan sangat layak jual.';
      case 'C':
        return 'Kondisi baik dengan beberapa tanda pemakaian normal. Masih layak untuk dijual.';
      case 'D':
        return 'Pakaian ini memiliki kerusakan yang signifikan dan tidak direkomendasikan untuk dijual.';
      default:
        return '';
    }
  };

  const handleShowInMarketplace = async () => {
    try {
      const productId = params.productId;
      
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'unsold' })
      });

      if (response.ok) {
        router.push(`/product/${productId}`);
      } else {
        const result = await response.json();
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error publishing product:', error);
      router.push(`/product/${params.productId}`);
    }
  };

  const handleBackToProfile = () => {
    router.push('/profile');
  };

  const getGradeColor = (gradeValue: string) => {
    switch (gradeValue) {
      case 'A': return 'text-green-600';
      case 'B': return 'text-blue-600';
      case 'C': return 'text-yellow-600';
      case 'D': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getGradeDescription = (gradeValue: string) => {
    switch (gradeValue) {
      case 'A': return 'Kondisi Sempurna!';
      case 'B': return 'Kondisi Sangat Baik!';
      case 'C': return 'Kondisi Baik';
      case 'D': return 'Tidak Layak Jual';
      default: return '';
    }
  };

  if (stage === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-between p-6">
        <div className="w-full max-w-md pt-12">
          <p className="text-gray-700 text-base leading-relaxed text-center">
            Sedang menganalisis kondisi pakaian kamu...
          </p>
        </div>

        <div className="flex flex-col items-center space-y-8">
          {/* Circular Progress */}
          <div className="relative w-48 h-48">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="#E5E7EB"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="url(#gradient)"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A78BFA" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-800">AI</div>
                <div className="text-sm text-gray-500 mt-1">{progress}%</div>
              </div>
            </div>
          </div>

          {/* Progress Text */}
          <p className="text-gray-600 text-sm font-medium text-center px-6">
            {progressText}
          </p>
        </div>

        <div className="w-full max-w-md pb-8">
          <p className="text-gray-500 text-sm text-center leading-relaxed">
            Sistem AI kami sedang mengecek kualitas, warna, dan kemungkinan cacat kecil.
            <br /><br />
            Mohon tunggu sebentar...
          </p>
        </div>
      </div>
    );
  }

  // Result Screen
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6">
      <div className="flex-1 flex flex-col items-center justify-center space-y-6 max-w-md mx-auto w-full">
        <p className="text-gray-700 text-base leading-relaxed text-center">
          Hasil grading oleh AI menunjukkan bahwa pakaian kamu....
        </p>

        {/* Grade Badge */}
        <div className={`text-5xl font-bold ${getGradeColor(grade)}`}>
          Grade {grade}
        </div>

        {/* Product Image */}
        <div className="relative w-full max-w-sm">
          <div className="aspect-square rounded-3xl overflow-hidden border-4 border-purple-300 shadow-lg bg-gray-200">
            {productImage ? (
              <img 
                src={productImage} 
                alt={product?.product_name || 'Product'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image
              </div>
            )}
          </div>
        </div>

        {/* Grade Status */}
        <div className={`text-2xl font-semibold ${getGradeColor(grade)}`}>
          {getGradeDescription(grade)}
        </div>

        {/* Reason */}
        <p className="text-gray-600 text-center text-base leading-relaxed px-4">
          {reason}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-8 max-w-md mx-auto w-full">
        <button 
          onClick={handleBackToProfile}
          className="flex-1 bg-gray-800 text-white py-4 rounded-2xl font-semibold hover:bg-gray-700 transition-colors"
        >
          Kembali ke Profil
        </button>
        <button 
          onClick={handleShowInMarketplace}
          className="flex-1 bg-green-400 text-gray-900 py-4 rounded-2xl font-semibold hover:bg-green-500 transition-colors"
        >
          Tampilkan di Marketplace
        </button>
      </div>
    </div>
  );
}