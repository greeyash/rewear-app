// app/api/donations/[donation_id]/report/route.ts
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ donation_id: string }> }
) {
  try {
    const formData = await req.formData();
    const { donation_id } = await params;
    const donationId = donation_id;
    const photo = formData.get("photo") as File;
    const description = formData.get("description") as string;
    const userId = formData.get("userId") as string;

    console.log("Report data:", { donationId, userId });

    if (!photo || !description || !userId) {
      return NextResponse.json({
        success: false,
        error: "Data tidak lengkap"
      }, { status: 400 });
    }

    // 1. Cek apakah user adalah creator
    const { data: donationData, error: donationError } = await supabase
      .from("donations")
      .select("creator_id, event_date, report_submitted_at")
      .eq("donation_id", donationId)
      .single();

    if (donationError || !donationData) {
      console.error("Get donation error:", donationError);
      return NextResponse.json({
        success: false,
        error: "Donasi tidak ditemukan"
      }, { status: 404 });
    }

    if (donationData.creator_id !== parseInt(userId)) {
      return NextResponse.json({
        success: false,
        error: "Anda tidak memiliki akses untuk upload laporan"
      }, { status: 403 });
    }

    if (donationData.report_submitted_at) {
      return NextResponse.json({
        success: false,
        error: "Laporan sudah disubmit sebelumnya"
      }, { status: 400 });
    }

    // 2. Upload foto ke Supabase Storage
    const fileName = `report-${Date.now()}-${photo.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("donation-photos")
      .upload(fileName, photo, {
        contentType: photo.type,
        cacheControl: "3600",
        upsert: false
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({
        success: false,
        error: "Gagal upload foto: " + uploadError.message
      }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("donation-photos")
      .getPublicUrl(fileName);

    console.log("Report photo uploaded:", publicUrl);

    // 3. Update donation dengan laporan
    const { error: updateError } = await supabase
      .from("donations")
      .update({
        report_description: description,
        report_photo_url: publicUrl,
        report_submitted_at: new Date().toISOString(),
        donation_status: "reported"
      })
      .eq("donation_id", donationId);

    if (updateError) {
      console.error("Update donation error:", updateError);
      
      // Cleanup: hapus foto yang sudah diupload
      await supabase.storage
        .from("donation-photos")
        .remove([fileName]);

      return NextResponse.json({
        success: false,
        error: "Gagal submit laporan: " + updateError.message
      }, { status: 500 });
    }

    console.log("Report submitted successfully");

    return NextResponse.json({
      success: true,
      message: "Laporan berhasil disubmit!"
    }, { status: 200 });

  } catch (err: any) {
    console.error("Upload report error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Terjadi kesalahan"
    }, { status: 500 });
  }
}