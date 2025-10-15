// app/donations/page.tsx
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

  const isEventPassed = (eventDate: string) => {
    const event = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return event < today;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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
      <div className="max-w-4xl mx-auto">
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
              const eventPassed = isEventPassed(donation.event_date);

              return (
                <div
                  key={donation.donation_id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-6">
                    {eventPassed && (
                      <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800 font-medium">
                          Kegiatan sudah berlangsung. Donasi tidak dapat dilakukan lagi.
                        </p>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {donation.organization.organization_name}
                        </h3>
                        <p className="text-gray-600 mb-1">
                          Target: {donation.donation_target}
                        </p>
                        <p className="text-sm text-gray-500 mb-2">
                          Tanggal Kegiatan: {formatDate(donation.event_date)}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {donation.donation_desc}
                        </p>
                      </div>
                    </div>

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

                    <button
                      onClick={() =>
                        router.push(`/donations/${donation.donation_id}/contribute`)
                      }
                      disabled={eventPassed}
                      className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                        eventPassed
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {eventPassed ? "Kegiatan Sudah Berlangsung" : "Kontribusi Sekarang"}
                    </button>
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