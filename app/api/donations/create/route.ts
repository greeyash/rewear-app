// app/api/donations/create/route.ts
// UPDATED: 2025-10-17 - Fix foto & deadline NULL issue
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const photo = formData.get("photo") as File;
    const userId = formData.get("userId") as string;
    const organizationName = formData.get("organizationName") as string;
    const organizationNPWP = formData.get("organizationNPWP") as string;
    const campaignName = formData.get("campaignName") as string;
    const donationTarget = formData.get("donationTarget") as string;
    const description = formData.get("description") as string;
    const targetQuantity = formData.get("targetQuantity") as string;
    const eventDate = formData.get("eventDate") as string;
    const donationDeadline = formData.get("donationDeadline") as string;

    console.log("Received data:", { 
      userId, 
      organizationName, 
      campaignName,
      hasPhoto: !!photo,
      photoName: photo?.name,
      eventDate,
      donationDeadline
    });

    if (!userId || !organizationName || !organizationNPWP || !campaignName || !targetQuantity || !eventDate || !donationDeadline) {
      return NextResponse.json({
        success: false,
        error: "Data tidak lengkap (required fields missing)"
      }, { status: 400 });
    }

    if (!photo) {
      return NextResponse.json({
        success: false,
        error: "Foto campaign harus diupload"
      }, { status: 400 });
    }

    // Validasi tanggal
    const deadline = new Date(donationDeadline);
    const event = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (event < today) {
      return NextResponse.json({
        success: false,
        error: "Tanggal pelaksanaan harus di masa depan"
      }, { status: 400 });
    }

    if (deadline >= event) {
      return NextResponse.json({
        success: false,
        error: "Deadline harus sebelum tanggal pelaksanaan"
      }, { status: 400 });
    }

    // 1. Upload foto ke Supabase Storage
    const fileName = `campaign-${Date.now()}-${photo.name}`;
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

    const { data: { publicUrl } } = supabase.storage
      .from("donation-photos")
      .getPublicUrl(fileName);

    console.log("Photo uploaded:", publicUrl);

    // 2. Create organization
    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .insert({
        user_id: parseInt(userId),
        organization_name: organizationName,
        organization_type: null
      })
      .select("organization_id")
      .single();

    if (orgError) {
      console.error("Organization error:", orgError);
      
      // Cleanup
      await supabase.storage
        .from("donation-photos")
        .remove([fileName]);

      return NextResponse.json({
        success: false,
        error: "Gagal membuat organisasi: " + orgError.message
      }, { status: 500 });
    }

    console.log("Organization created:", orgData);

    // 3. Create donation campaign
    const { data: donationData, error: donationError } = await supabase
      .from("donations")
      .insert({
        donation_target: donationTarget,
        donation_status: "in progress",
        donation_desc: description,
        target_quantity: parseInt(targetQuantity),
        current_quantity: 0,
        organization_id: orgData.organization_id,
        organization_license: organizationNPWP,
        event_date: eventDate,
        donation_deadline: donationDeadline,
        campaign_photo_url: publicUrl,
        creator_id: parseInt(userId)
      })
      .select("donation_id")
      .single();

    if (donationError) {
      console.error("Donation error:", donationError);
      
      // Cleanup
      await supabase.storage
        .from("donation-photos")
        .remove([fileName]);
      
      await supabase
        .from("organizations")
        .delete()
        .eq("organization_id", orgData.organization_id);

      return NextResponse.json({
        success: false,
        error: "Gagal membuat donasi: " + donationError.message
      }, { status: 500 });
    }

    console.log("Donation created:", donationData);

    return NextResponse.json({
      success: true,
      donation_id: donationData.donation_id,
      message: "Kegiatan donasi berhasil dibuat!"
    }, { status: 201 });

  } catch (err: any) {
    console.error("Create donation error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Terjadi kesalahan"
    }, { status: 500 });
  }
}