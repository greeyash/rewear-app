// app/donations/[donation_id]/report/page.tsx
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
  donation_status: string;
  creator_id: number;
  report_description: string | null;
  report_photo_url: string | null;
  report_submitted_at: string | null;
  organization: {
    organization_name: string;
  };
}

export default function UploadReportPage() {
  const router = useRouter();
  const params = useParams();
  const donationId = params.donation_id as string;

  const [donation, setDonation] = useState<DonationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    photo: null as File | null,
    description: ""
  });

  useEffect(() => {
    fetchDonationDetail();
  }, [donationId]);

  const fetchDonationDetail = async () => {
    try {
      const response = await fetch(`/api/donations/${donationId}`);
      const result = await response.json();

      if (result.success) {
        const userId = "1"; // Hardcode user_id = 1 (penyelenggara)

        // Cek apakah user adalah creator
        if (result.donation.creator_id !== parseInt(userId)) {
          alert("Anda tidak memiliki akses untuk upload laporan");
          router.push("/donations");
          return;
        }

        // Cek apakah sudah ada laporan
        if (result.donation.report_submitted_at) {
          alert("Laporan sudah disubmit sebelumnya");
          router.push("/donations");
          return;
        }

        setDonation(result.donation);
      } else {
        alert("Gagal memuat detail donasi");
        router.push("/donations");
      }
    } catch (error) {
      console.error("Error fetching donation:", error);
      alert("Terjadi kesalahan");
      router.push("/donations");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getDaysAfterEvent = () => {
    if (!donation) return 0;
    const eventDate = new Date(donation.event_date);
    const today = new Date();
    const diffTime = today.getTime() - eventDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isOverdue = () => {
    return getDaysAfterEvent() > 10;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userId = "1"; // Hardcode user_id = 1

      if (!formData.photo) {
        alert("Foto dokumentasi harus diupload");
        setIsSubmitting(false);
        return;
      }

      if (!formData.description.trim()) {
        alert("Deskripsi laporan harus diisi");
        setIsSubmitting(false);
        return;
      }

      const submitData = new FormData();
      submitData.append("photo", formData.photo);
      submitData.append("description", formData.description);
      submitData.append("userId", userId);

      const response = await fetch(`/api/donations/${donationId}/report`, {
        method: "POST",
        body: submitData,
      });

      const result = await response.json();

      if (result.success) {
        alert("Laporan berhasil disubmit!");
        router.push("/donations");
      } else {
        alert(result.error || "Gagal submit laporan");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat submit laporan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-gray-600">Memuat...</div>
      </div>
    );
  }

  if (!donation) {
    return null;
  }

  const daysAfter = getDaysAfterEvent();
  const overdue = isOverdue();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {donation.organization.organization_name}
          </h2>
          <p className="text-gray-600 mb-2">Target: {donation.donation_target}</p>
          <p className="text-sm text-gray-500 mb-2">
            Tanggal Kegiatan: {new Date(donation.event_date).toLocaleDateString('id-ID')}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Total Terkumpul: {donation.current_quantity} / {donation.target_quantity} pakaian
          </p>

          {overdue ? (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-900 mb-1">
                Peringatan: Batas Waktu Terlewat
              </p>
              <p className="text-sm text-red-800">
                Sudah {daysAfter} hari sejak kegiatan berlangsung. Batas upload laporan adalah H+10 (maksimal 10 hari setelah kegiatan).
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Hari ke-{daysAfter} sejak kegiatan. Upload laporan maksimal H+10 ({10 - daysAfter} hari lagi).
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Upload Laporan Pertanggungjawaban
          </h1>
          <p className="text-gray-600 mb-6">
            Upload foto dokumentasi dan deskripsi kegiatan yang telah dilaksanakan
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto Dokumentasi Kegiatan *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-500 transition-colors">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview(null);
                        setFormData({ ...formData, photo: null });
                      }}
                      className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Hapus Foto
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <div className="text-6xl mb-2">+</div>
                    <p className="text-gray-600">Klik untuk upload foto dokumentasi</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      required
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Laporan Kegiatan *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Jelaskan pelaksanaan kegiatan, penerima manfaat, dan hal-hal penting lainnya..."
                required
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
              <p className="text-sm font-semibold text-yellow-900 mb-1">
                Penting
              </p>
              <p className="text-sm text-yellow-800">
                Laporan ini akan ditampilkan kepada semua kontributor sebagai bentuk transparansi dan pertanggungjawaban penggunaan donasi.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push("/donations")}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Mengirim..." : "Submit Laporan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}