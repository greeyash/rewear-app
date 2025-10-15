// app/api/donations/create/route.ts
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const {
      userId,
      organizationName,
      organizationNPWP,
      campaignName,
      donationTarget,
      description,
      targetQuantity,
      eventDate
    } = body;

    console.log("Received data:", body);

    if (!userId || !organizationName || !organizationNPWP || !campaignName || !targetQuantity || !eventDate) {
      return NextResponse.json({
        success: false,
        error: "Data tidak lengkap"
      }, { status: 400 });
    }

    // Validasi tanggal
    const selectedDate = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return NextResponse.json({
        success: false,
        error: "Tanggal pelaksanaan harus di masa depan"
      }, { status: 400 });
    }

    // 1. Create organization
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
      return NextResponse.json({
        success: false,
        error: "Gagal membuat organisasi: " + orgError.message
      }, { status: 500 });
    }

    console.log("Organization created:", orgData);

    // 2. Create donation campaign
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
        creator_id: parseInt(userId)
      })
      .select("donation_id")
      .single();

    if (donationError) {
      console.error("Donation error:", donationError);
      
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