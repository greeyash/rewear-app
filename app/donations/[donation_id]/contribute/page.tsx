// app/donations/[donation_id]/contribute/page.tsx
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
  organization: {
    organization_name: string;
  };
}

export default function ContributePage() {
  const router = useRouter();
  const params = useParams();
  const donationId = params.donation_id as string;

  const [donation, setDonation] = useState<DonationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    photo: null as File | null,
    quantity: ""
  });

  useEffect(() => {
    fetchDonationDetail();
  }, [donationId]);

  const fetchDonationDetail = async () => {
    try {
      const response = await fetch(`/api/donations/${donationId}`);
      const result = await response.json();

      if (result.success) {
        // Cek apakah tanggal kegiatan sudah lewat
        const eventDate = new Date(result.donation.event_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (eventDate < today) {
          alert("Kegiatan sudah berlangsung. Tidak dapat melakukan donasi lagi.");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userId = "2"; // Hardcode user_id = 2 (contributor)

      if (!formData.photo) {
        alert("Foto barang harus diupload");
        setIsSubmitting(false);
        return;
      }

      if (!formData.quantity || parseInt(formData.quantity) <= 0) {
        alert("Quantity harus lebih dari 0");
        setIsSubmitting(false);
        return;
      }

      const submitData = new FormData();
      submitData.append("photo", formData.photo);
      submitData.append("quantity", formData.quantity);
      submitData.append("userId", userId);

      const response = await fetch(`/api/donations/${donationId}/contribute`, {
        method: "POST",
        body: submitData,
      });

      const result = await response.json();

      if (result.success) {
        alert("Kontribusi berhasil! Terima kasih atas donasi Anda");
        router.push("/donations");
      } else {
        alert(result.error || "Gagal menambahkan kontribusi");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat menambahkan kontribusi");
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

  const progress = Math.min(
    Math.round((donation.current_quantity / donation.target_quantity) * 100),
    100
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {donation.organization.organization_name}
          </h2>
          <p className="text-gray-600 mb-2">Target: {donation.donation_target}</p>
          <p className="text-sm text-gray-500 mb-4">{donation.donation_desc}</p>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                {donation.current_quantity} / {donation.target_quantity} pakaian
              </span>
              <span className="font-semibold">{progress}% terkumpul</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Form Kontribusi Donasi
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Foto Barang yang Didonasikan *
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
                    <p className="text-gray-600">Klik untuk upload foto</p>
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
                Jumlah Pakaian yang Didonasikan *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Contoh: 5"
                min="1"
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Data pengambilan barang akan menggunakan informasi dari akun Anda (nama, email, alamat)
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Mengirim..." : "Kirim Kontribusi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}