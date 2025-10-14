// hooks/useAIGrading.ts
import { useState } from 'react';

interface GradingDetails {
  condition: string;
  defects: string[];
  wearability: string;
}

interface GradingResult {
  grade: 'A' | 'B' | 'C' | 'D';
  reason: string;
  details: GradingDetails;
  product_id: number;
}

interface UseAIGradingReturn {
  gradeProduct: (productId: number) => Promise<GradingResult | null>;
  isLoading: boolean;
  progress: number;
  progressText: string;
  error: string | null;
}

const progressSteps = [
  { percent: 15, text: 'Menganalisis foto tampak depan...', delay: 1000 },
  { percent: 30, text: 'Memeriksa foto tampak belakang...', delay: 1000 },
  { percent: 45, text: 'Mengidentifikasi tag dan label...', delay: 1200 },
  { percent: 60, text: 'Mengevaluasi tekstur kain...', delay: 1500 },
  { percent: 75, text: 'Mengidentifikasi cacat atau noda...', delay: 1200 },
  { percent: 90, text: 'Menentukan grade akhir...', delay: 1000 },
];

export const useAIGrading = (): UseAIGradingReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const simulateProgress = async () => {
    for (const step of progressSteps) {
      setProgress(step.percent);
      setProgressText(step.text);
      await new Promise(resolve => setTimeout(resolve, step.delay));
    }
  };

  const gradeProduct = async (productId: number): Promise<GradingResult | null> => {
    try {
      setIsLoading(true);
      setError(null);
      setProgress(0);

      // Start progress simulation
      const progressPromise = simulateProgress();

      // Call API
      const response = await fetch('/api/ai/grade-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_id: productId }),
      });

      const data = await response.json();

      // Wait for progress to finish
      await progressPromise;
      
      // Set final progress
      setProgress(100);
      setProgressText('Selesai!');

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gagal melakukan grading');
      }

      // Small delay before returning result
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        grade: data.grade,
        reason: data.reason,
        details: data.details,
        product_id: data.product_id,
      };

    } catch (err: any) {
      console.error('Grading error:', err);
      setError(err.message || 'Terjadi kesalahan saat grading');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    gradeProduct,
    isLoading,
    progress,
    progressText,
    error,
  };
};

// Helper untuk get grade info
export const getGradeInfo = (grade: 'A' | 'B' | 'C' | 'D') => {
  const gradeData = {
    A: {
      title: 'Kondisi Sempurna!',
      description: 'Wah, bajumu nyaris seperti baru keluar dari toko! AI mendeteksi tidak ada noda, benang longgar, atau tanda pemakaian berarti.',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      sellable: true,
    },
    B: {
      title: 'Kondisi Sangat Baik!',
      description: 'Pakaian ini sudah pernah dipakai tapi masih dalam kondisi sangat baik. Tidak ada cacat yang signifikan.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      sellable: true,
    },
    C: {
      title: 'Kondisi Baik',
      description: 'Ada beberapa tanda pemakaian seperti noda kecil atau benang lepas, tapi masih layak pakai dan dijual.',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      sellable: true,
    },
    D: {
      title: 'Tidak Layak Jual',
      description: 'Sayangnya pakaian ini memiliki kerusakan yang cukup parah dan tidak disarankan untuk dijual.',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      sellable: false,
    },
  };

  return gradeData[grade];
};