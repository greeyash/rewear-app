"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface AddressDisplayProps {
  address?: string;
  location?: string;
  showEditButton?: boolean;
}

export default function AddressDisplay({ 
  address, 
  location, 
  showEditButton = true 
}: AddressDisplayProps) {
  const router = useRouter();

  const hasAddress = address && location;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          Alamat Pengiriman
        </h3>
        {showEditButton && (
          <button
            onClick={() => router.push('/profile/edit-address')}
            className="text-[#66bb6a] text-sm font-medium hover:text-[#4caf50] flex items-center gap-1 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </button>
        )}
      </div>

      {hasAddress ? (
        <div className="space-y-2">
          {/* Location */}
          <div className="flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-gray-500">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <div>
              <p className="text-xs text-gray-500">Kota/Kabupaten</p>
              <p className="text-sm font-medium text-gray-900">{location}</p>
            </div>
          </div>

          {/* Full Address */}
          <div className="flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-gray-500">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Alamat Lengkap</p>
              <p className="text-sm text-gray-700 leading-relaxed">{address}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-3">Alamat pengiriman belum diatur</p>
          {showEditButton && (
            <button
              onClick={() => router.push('/profile/edit-address')}
              className="inline-flex items-center gap-2 bg-[#66bb6a] text-white px-4 py-2 rounded-lg hover:bg-[#4caf50] transition-colors text-sm font-medium"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Tambah Alamat
            </button>
          )}
        </div>
      )}
    </div>
  );
}