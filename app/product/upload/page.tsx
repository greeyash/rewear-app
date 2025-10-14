"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

type PhotoType = 'front' | 'back' | 'detail' | 'label' | 'additional';

interface FormData {
  productName: string;
  category: string;
  size: string;
  description: string;
  price: string;
}

export default function SellClothingForm() {
  const router = useRouter();
  const [photos, setPhotos] = useState<Record<PhotoType, string | null>>({
    front: null,
    back: null,
    detail: null,
    label: null,
    additional: null
  });

  const [formData, setFormData] = useState<FormData>({
    productName: '',
    category: '',
    size: '',
    description: '',
    price: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handlePhotoUpload = (type: PhotoType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => ({ ...prev, [type]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const PhotoUploadBox = ({ type, title, description, photo }: {
    type: PhotoType;
    title: string;
    description: string;
    photo: string | null;
  }) => (
    <div className="mb-4">
      <div className="flex items-start gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium flex-shrink-0">
          {type === 'front' ? '1' : type === 'back' ? '2' : type === 'detail' ? '3' : type === 'label' ? '4' : '5'}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
        </div>
      </div>
      
      <label className="block">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handlePhotoUpload(type, e)}
          className="hidden"
        />
        <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors overflow-hidden">
          {photo ? (
            <img src={photo} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-gray-400">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto">
                <path d="M24 14V34M14 24H34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          )}
        </div>
      </label>
    </div>
  );

  const handleSubmit = async () => {
    // Validasi
    if (!photos.front) {
      alert('Foto tampak depan wajib diupload!');
      return;
    }
    if (!formData.productName || !formData.category || !formData.size || !formData.price) {
      alert('Harap lengkapi semua field yang wajib!');
      return;
    }

    setIsLoading(true);

    try {
      // Convert photos to base64 (remove data:image/... prefix)
      const photosBase64: Record<string, string> = {};
      (Object.keys(photos) as PhotoType[]).forEach((key) => {
        const value = photos[key];
        if (value) {
          photosBase64[key] = value.split(',')[1]; // Remove data URL prefix
        }
      });

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: formData.productName,
          user_id: 1, // TODO: Get from auth session
          price: formData.price,
          description: formData.description,
          category: formData.category,
          size: formData.size,
          material: null, // Optional
          photos: photosBase64
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Produk berhasil diupload!');
        // Redirect ke grading page dengan product_id
        router.push(`/grading/${result.product_id}`);
      } else {
        alert('Error: ' + result.error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Gagal submit produk');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#c8e6c9] px-4 py-4 flex items-center sticky top-0 z-10">
        <button className="p-2 -ml-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <h1 className="flex-1 text-center text-xl font-semibold pr-10">Jual Pakaian</h1>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Unggah Foto Section */}
        <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          <h2 className="text-lg font-semibold text-purple-500 mb-4">Unggah foto pakaian</h2>
          
          <PhotoUploadBox
            type="front"
            title="Tampak depan*"
            description="Ambil foto seluruh pakaian dari depan. Pastikan rata, tidak terlipat, dan pencahayaan alami. Tips: Gunakan background netral (putih/krem muda) agar Allahh mudah membaca tekstur."
            photo={photos.front}
          />

          <PhotoUploadBox
            type="back"
            title="Tampak belakang*"
            description="Foto sisi belakang pakaian. Cek bagian leher, label, atau kentutan diukir. Akan membantu mengidentifikasi kondisi depan-belakang buatan menutuang trade."
            photo={photos.back}
          />

          <PhotoUploadBox
            type="detail"
            title="Foto Close-up Area Detail / Cacat*"
            description="Ambil foto jarak dekat (10-15 cm) untuk menampiikan tekstur dan kondisi riaya pakaian. Fokus pada bagian yang rusak atau bermoda (noda, sobek, keriring lepas). Jika tidak ada cacat, unggah foto detail kain atau sistem dengan jelas untuk lebih akurat."
            photo={photos.detail}
          />

          <PhotoUploadBox
            type="label"
            title="Foto Label (Opsional tapi Disarankan)"
            description="Foto label atau tag merek jika masih tersedia untuk membantu verifikasi produk."
            photo={photos.label}
          />

          <PhotoUploadBox
            type="additional"
            title="Foto Tambahan"
            description=""
            photo={photos.additional}
          />
        </div>

        {/* Info Produk Section */}
        <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          <h2 className="text-lg font-semibold text-purple-500 mb-4">Info Produk</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Produk</label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-purple-300 appearance-none"
              >
                <option value="">Pilih Kategori Pakaian</option>
                <option value="kaos">Kaos</option>
                <option value="kemeja">Kemeja</option>
                <option value="celana">Celana</option>
                <option value="jaket">Jaket</option>
                <option value="dress">Dress</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ukuran</label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-purple-300 appearance-none"
              >
                <option value="">Pilih Ukuran</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Produk</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Harga</label>
              <input
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Masukkan hanya angka"
                className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>

            <div className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <p>Grade akan ditentukan secara otomatis oleh sistem AI berdasarkan hasil evaluasi.</p>
            </div>
          </div>
        </div>

        {/* Lokasi Penjual Section */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-purple-500 mb-4">Lokasi Penjual</h2>
          
          <div className="space-y-2">
            <div>
              <span className="font-medium text-gray-700">Roti</span>
              <span className="text-gray-500 ml-2">(+62) 812-9045-2234</span>
            </div>
            <p className="text-gray-700">Perumahan Griya Indah Blok B3 No. 17, Cibiru Wetan</p>
            <p className="text-gray-700">KOTA BANDUNG, JAWA BARAT, ID 40625</p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-gray-900 text-white py-4 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sedang mengunggah...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}