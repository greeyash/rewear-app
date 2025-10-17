// app/donations/[donation_id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface DonationDetail {
  donation_id: number;
  donation_target: string;
  donation_desc: string;
  target_quantity: number;
  current_quantity: number;
  event_date: string;
  donation_deadline: string;
  donation_status: string;
  campaign_photo_url: string;
  report_description: string | null;
  report_photo_url: string | null;
  report_submitted_at: string | null;
  organization: {
    organization_name: string;
  };
}

export default function DonationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const donationId = params.donation_id as string;

  const [donation, setDonation] = useState<DonationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [donationId]);

  const fetchData = async () => {
    try {
      const donationRes = await fetch(`/api/donations/${donationId}`);
      const donationResult = await donationRes.json();

      if (donationResult.success) {
        setDonation(donationResult.donation);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const calculateProgress = () => {
    if (!donation) return 0;
    return Math.min(
      Math.round((donation.current_quantity / donation.target_quantity) * 100),
      100
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-gray-600">Memuat...</div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-gray-600">Donasi tidak ditemukan</div>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <span>&larr;</span> Kembali
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {donation.campaign_photo_url && (
            <img
              src={donation.campaign_photo_url}
              alt={donation.organization.organization_name}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}

          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {donation.organization.organization_name}
          </h1>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Target Penerima</p>
              <p className="text-gray-800 font-medium">{donation.donation_target}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Batas Pengumpulan Donasi</p>
              <p className="text-gray-800 font-medium">{formatDate(donation.donation_deadline)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Tanggal Kegiatan</p>
              <p className="text-gray-800 font-medium">{formatDate(donation.event_date)}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Deskripsi Kegiatan</p>
            <p className="text-gray-700">{donation.donation_desc}</p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress Donasi</span>
              <span className="font-semibold">
                {donation.current_quantity} / {donation.target_quantity} pakaian ({progress}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            {donation.donation_status === "in progress" && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Sedang Berjalan
              </span>
            )}
            {donation.donation_status === "completed" && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Target Tercapai
              </span>
            )}
            {donation.donation_status === "reported" && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                Laporan Tersedia
              </span>
            )}
          </div>
        </div>

        {donation.report_submitted_at && donation.report_description && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Laporan Pertanggungjawaban
            </h2>
            
            <p className="text-sm text-gray-500 mb-4">
              Disubmit pada: {formatDate(donation.report_submitted_at)}
            </p>

            {donation.report_photo_url && (
              <div className="mb-6">
                <img
                  src={donation.report_photo_url}
                  alt="Dokumentasi Kegiatan"
                  className="w-full rounded-lg shadow-md"
                />
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500 mb-2">Deskripsi Laporan</p>
              <p className="text-gray-700 whitespace-pre-wrap">{donation.report_description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}