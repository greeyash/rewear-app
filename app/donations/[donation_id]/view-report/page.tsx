// app/donations/[donation_id]/view-report/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface DonationWithReport {
  donation_id: number;
  donation_target: string;
  donation_desc: string;
  target_quantity: number;
  current_quantity: number;
  event_date: string;
  donation_status: string;
  report_description: string | null;
  report_photo_url: string | null;
  report_submitted_at: string | null;
  organization: {
    organization_name: string;
  };
}

export default function ViewReportPage() {
  const router = useRouter();
  const params = useParams();
  const donationId = params.donation_id as string;

  const [donation, setDonation] = useState<DonationWithReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [donationId]);

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/donations/${donationId}`);
      const result = await response.json();

      if (result.success) {
        if (!result.donation.report_submitted_at) {
          alert("Laporan belum tersedia untuk donasi ini");
          router.push("/donations");
          return;
        }
        setDonation(result.donation);
      } else {
        alert("Gagal memuat laporan");
        router.push("/donations");
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      alert("Terjadi kesalahan");
      router.push("/donations");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-gray-600">Memuat laporan...</div>
      </div>
    );
  }

  if (!donation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <span className="mr-2">←</span> Kembali
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Laporan Pertanggungjawaban
              </h1>
              <h2 className="text-xl text-gray-700 mb-1">
                {donation.organization.organization_name}
              </h2>
              <p className="text-sm text-gray-600">
                {donation.donation_target}
              </p>
            </div>
            <div className="bg-green-100 px-4 py-2 rounded-lg">
              <p className="text-xs text-green-800 font-medium">Terverifikasi</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-500 mb-1">Tanggal Kegiatan</p>
              <p className="text-sm font-semibold text-gray-800">
                {formatDate(donation.event_date)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Laporan Disubmit</p>
              <p className="text-sm font-semibold text-gray-800">
                {donation.report_submitted_at 
                  ? formatDate(donation.report_submitted_at)
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Terkumpul</p>
              <p className="text-sm font-semibold text-gray-800">
                {donation.current_quantity} / {donation.target_quantity} pakaian
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <p className="text-sm font-semibold text-green-600">
                {donation.donation_status === "reported" ? "Selesai" : donation.donation_status}
              </p>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Dokumentasi Kegiatan
          </h3>
          
          {donation.report_photo_url && (
            <div className="mb-6">
              <img
                src={donation.report_photo_url}
                alt="Dokumentasi kegiatan"
                className="w-full rounded-xl shadow-lg"
              />
            </div>
          )}

          <h3 className="text-lg font-bold text-gray-800 mb-3">
            Deskripsi Laporan
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {donation.report_description || "Tidak ada deskripsi"}
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900 font-medium mb-1">
            ℹ️ Tentang Laporan Ini
          </p>
          <p className="text-sm text-blue-800">
            Laporan ini dibuat oleh penyelenggara sebagai bentuk transparansi dan pertanggungjawaban 
            atas penggunaan donasi yang telah terkumpul. Terima kasih atas kontribusi Anda!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => router.push(`/donations/${donationId}`)}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Lihat Detail Donasi
          </button>
          <button
            onClick={() => router.push("/donations")}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Kembali ke Daftar
          </button>
        </div>
      </div>
    </div>
  );
}