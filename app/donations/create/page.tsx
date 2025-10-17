// app/donations/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateDonationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    photo: null as File | null,
    organizationName: "",
    organizationNPWP: "",
    campaignName: "",
    donationTarget: "",
    description: "",
    targetQuantity: "",
    eventDate: "",
    donationDeadline: ""
  });

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userId = "1";

      if (!formData.organizationName || !formData.campaignName || !formData.targetQuantity || !formData.eventDate || !formData.donationDeadline || !formData.photo) {
        alert("Mohon lengkapi semua field yang wajib diisi");
        setIsLoading(false);
        return;
      }

      // Validasi tanggal deadline harus sebelum tanggal event
      const deadline = new Date(formData.donationDeadline);
      const eventDate = new Date(formData.eventDate);
      
      if (deadline >= eventDate) {
        alert("Tanggal deadline pengumpulan harus sebelum tanggal pelaksanaan kegiatan");
        setIsLoading(false);
        return;
      }

      // Validasi tanggal harus di masa depan
      const selectedDate = new Date(formData.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        alert("Tanggal pelaksanaan harus di masa depan");
        setIsLoading(false);
        return;
      }

      if (deadline < today) {
        alert("Tanggal deadline harus di masa depan");
        setIsLoading(false);
        return;
      }

      const submitData = new FormData();
      submitData.append("photo", formData.photo);
      submitData.append("userId", userId);
      submitData.append("organizationName", formData.organizationName);
      submitData.append("organizationNPWP", formData.organizationNPWP);
      submitData.append("campaignName", formData.campaignName);
      submitData.append("donationTarget", formData.donationTarget);
      submitData.append("description", formData.description);
      submitData.append("targetQuantity", formData.targetQuantity);
      submitData.append("eventDate", formData.eventDate);
      submitData.append("donationDeadline", formData.donationDeadline);

      const response = await fetch("/api/donations/create", {
        method: "POST",
        body: submitData,
      });

      const result = await response.json();

      if (result.success) {
        alert("Kegiatan donasi berhasil dibuat!");
        router.push("/donations");
      } else {
        alert(result.error || "Gagal membuat kegiatan donasi");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat membuat kegiatan donasi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Buat Kegiatan Donasi
          </h1>
          <p className="text-gray-600 mb-8">
            Galang donasi pakaian untuk kegiatan sosial Anda
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Foto Kegiatan
              </h2>
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
                  <label className="cursor-pointer block">
                    <div className="text-6xl mb-2">+</div>
                    <p className="text-gray-600 mb-2">Klik untuk upload foto</p>
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {!photoPreview && (
                <p className="text-xs text-red-500 mt-2">* Foto kegiatan wajib diupload</p>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Info Organisasi
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Organisasi *
                  </label>
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Contoh: Yayasan Peduli Anak"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NPWP Organisasi *
                  </label>
                  <input
                    type="text"
                    name="organizationNPWP"
                    value={formData.organizationNPWP}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Contoh: 12.345.678.9-012.000"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Info Kegiatan Donasi
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Kegiatan *
                  </label>
                  <input
                    type="text"
                    name="campaignName"
                    value={formData.campaignName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Contoh: Bakti Sosial Bandung - Warm Clothes for Kids"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Penerima Donasi *
                  </label>
                  <input
                    type="text"
                    name="donationTarget"
                    value={formData.donationTarget}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Contoh: Anak usia 5-12 tahun"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Quantity (jumlah pakaian yang dibutuhkan) *
                  </label>
                  <input
                    type="number"
                    name="targetQuantity"
                    value={formData.targetQuantity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Contoh: 100"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Pelaksanaan Kegiatan *
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batas Waktu Pengumpulan Donasi *
                  </label>
                  <input
                    type="date"
                    name="donationDeadline"
                    value={formData.donationDeadline}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Deadline harus sebelum tanggal pelaksanaan kegiatan
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Kegiatan *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Jelaskan kegiatan donasi Anda..."
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Setelah kegiatan dibuat, kontributor dapat menyumbangkan pakaian mereka dengan mengunggah foto dan mengisi data pengambilan barang.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
              <p className="text-sm font-semibold text-yellow-900 mb-1">
                Peringatan Penting
              </p>
              <p className="text-sm text-yellow-800">
                Setelah kegiatan selesai, penyelenggara WAJIB mengunggah laporan pertanggungjawaban atau bukti dokumentasi kegiatan. Laporan ini akan ditampilkan kepada para kontributor sebagai bukti transparansi.
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
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Membuat..." : "Buat Kegiatan Donasi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}