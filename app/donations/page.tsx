// app/donations/page.tsx
// UPDATED: 2025-10-18 - Desktop layout with side image
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Donation {
  donation_id: number;
  donation_target: string;
  donation_desc: string;
  target_quantity: number;
  current_quantity: number;
  donation_status: string;
  event_date: string;
  donation_deadline: string;
  campaign_photo_url: string;
  creator_id: number;
  report_submitted_at: string | null;
  organization: {
    organization_name: string;
  };
}

export default function DonationsListPage() {
  const router = useRouter();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await fetch("/api/donations/list");
      const result = await response.json();

      if (result.success) {
        setDonations(result.donations);
      } else {
        console.error("Failed to fetch donations:", result.error);
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const isDeadlinePassed = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deadlineDate < today;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const needsReport = (donation: Donation) => {
    if (donation.report_submitted_at) return false;
    if (donation.donation_status !== "completed") return false;
    
    const eventDate = new Date(donation.event_date);
    const today = new Date();
    const diffTime = today.getTime() - eventDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0;
  };

  const isReportOverdue = (donation: Donation) => {
    if (donation.report_submitted_at) return false;
    
    const eventDate = new Date(donation.event_date);
    const today = new Date();
    const diffTime = today.getTime() - eventDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 10;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-gray-600">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Donasi yang Sedang Berjalan
          </h1>
          <p className="text-gray-600">
            Pilih kegiatan donasi dan berkontribusi untuk membantu sesama
          </p>
        </div>

        {donations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-600">Belum ada kegiatan donasi tersedia</p>
          </div>
        ) : (
          <div className="space-y-6">
            {donations.map((donation) => {
              const progress = calculateProgress(
                donation.current_quantity,
                donation.target_quantity
              );
              const deadlinePassed = isDeadlinePassed(donation.donation_deadline);
              const needReport = needsReport(donation);
              const reportOverdue = isReportOverdue(donation);
              const currentUserId = "1";
              const isCreator = donation.creator_id === parseInt(currentUserId);

              return (
                <div
                  key={donation.donation_id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => router.push(`/donations/${donation.donation_id}`)}
                >
                  <div className="flex">
                    {/* Content Section */}
                    <div className="flex-1 p-6">
                      {deadlinePassed && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm text-red-800 font-medium">
                            Batas pengumpulan donasi sudah lewat
                          </p>
                        </div>
                      )}

                      {needReport && isCreator && (
                        <div className={`mb-4 border rounded-lg p-3 ${
                          reportOverdue 
                            ? "bg-red-50 border-red-300" 
                            : "bg-yellow-50 border-yellow-300"
                        }`}>
                          <p className={`text-sm font-medium ${
                            reportOverdue ? "text-red-900" : "text-yellow-900"
                          }`}>
                            {reportOverdue 
                              ? "Batas upload laporan terlewat (H+10)!" 
                              : "Wajib upload laporan pertanggungjawaban"}
                          </p>
                        </div>
                      )}

                      {donation.report_submitted_at && (
                        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-800 font-medium">
                            ✓ Laporan sudah disubmit
                          </p>
                        </div>
                      )}

                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {donation.organization.organization_name}
                      </h3>
                      
                      <p className="text-gray-600 mb-1">
                        Target: {donation.donation_target}
                      </p>
                      
                      <p className="text-sm text-gray-500 mb-1">
                        Deadline: {formatDate(donation.donation_deadline)}
                      </p>
                      
                      <p className="text-sm text-gray-500 mb-3">
                        Tanggal Kegiatan: {formatDate(donation.event_date)}
                      </p>

                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                        {donation.donation_desc}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>
                            {donation.current_quantity} / {donation.target_quantity} pakaian
                          </span>
                          <span className="font-semibold">{progress}% terkumpul</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-green-500 h-3 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {donation.report_submitted_at ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/donations/${donation.donation_id}/view-report`);
                          }}
                          className="w-full px-6 py-3 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
                        >
                          📄 Lihat Laporan Pertanggungjawaban
                        </button>
                      ) : needReport && isCreator ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/donations/${donation.donation_id}/report`);
                          }}
                          className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                            reportOverdue
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-yellow-600 hover:bg-yellow-700"
                          } text-white`}
                        >
                          Upload Laporan Pertanggungjawaban
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/donations/${donation.donation_id}/contribute`);
                          }}
                          disabled={deadlinePassed}
                          className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                            deadlinePassed
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                        >
                          {deadlinePassed ? "Pengumpulan Sudah Ditutup" : "Kontribusi Sekarang"}
                        </button>
                      )}
                    </div>

                    {/* Image Section - Faded Background */}
                    {donation.campaign_photo_url && (
                      <div 
                        className="w-80 flex-shrink-0 relative"
                        style={{
                          backgroundImage: `linear-gradient(to left, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 100%), url(${donation.campaign_photo_url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/40"></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}