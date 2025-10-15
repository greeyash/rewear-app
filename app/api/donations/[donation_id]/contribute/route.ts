// app/api/donations/[donation_id]/contribute/route.ts
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { donation_id: string } }
) {
  try {
    const formData = await req.formData();
    
    const donationId = params.donation_id;
    const photo = formData.get("photo") as File;
    const quantity = formData.get("quantity") as string;
    const userId = formData.get("userId") as string;

    console.log("Contribution data:", { donationId, quantity, userId });

    if (!photo || !quantity || !userId) {
      return NextResponse.json({
        success: false,
        error: "Data tidak lengkap"
      }, { status: 400 });
    }

    // 1. Upload foto ke Supabase Storage
    const fileName = `contribution-${Date.now()}-${photo.name}`;
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

    console.log("Photo uploaded:", publicUrl);

    // 2. Insert contribution
    const { data: contributionData, error: contributionError } = await supabase
      .from("donation_contributions")
      .insert({
        donation_id: parseInt(donationId),
        donor_id: parseInt(userId),
        quantity: parseInt(quantity),
        photo_url: publicUrl
      })
      .select("contribution_id")
      .single();

    if (contributionError) {
      console.error("Contribution error:", contributionError);
      
      // Cleanup: hapus foto yang sudah diupload
      await supabase.storage
        .from("donation-photos")
        .remove([fileName]);

      return NextResponse.json({
        success: false,
        error: "Gagal menambahkan kontribusi: " + contributionError.message
      }, { status: 500 });
    }

    console.log("Contribution created:", contributionData);

    // 3. Update current_quantity di donations
    const { data: donationData, error: donationError } = await supabase
      .from("donations")
      .select("current_quantity, target_quantity")
      .eq("donation_id", donationId)
      .single();

    if (donationError) {
      console.error("Get donation error:", donationError);
      return NextResponse.json({
        success: false,
        error: "Gagal mengupdate quantity: " + donationError.message
      }, { status: 500 });
    }

    const newCurrentQuantity = donationData.current_quantity + parseInt(quantity);
    const newStatus = newCurrentQuantity >= donationData.target_quantity 
      ? "completed" 
      : "in progress";

    const { error: updateError } = await supabase
      .from("donations")
      .update({
        current_quantity: newCurrentQuantity,
        donation_status: newStatus
      })
      .eq("donation_id", donationId);

    if (updateError) {
      console.error("Update donation error:", updateError);
      return NextResponse.json({
        success: false,
        error: "Gagal mengupdate donation: " + updateError.message
      }, { status: 500 });
    }

    console.log("Donation updated:", { newCurrentQuantity, newStatus });

    // 4. Update total_contrib user (manual update, bukan pakai RPC)
    const { data: userData, error: getUserError } = await supabase
      .from("users")
      .select("total_contrib")
      .eq("user_id", parseInt(userId))
      .single();

    if (!getUserError && userData) {
      await supabase
        .from("users")
        .update({
          total_contrib: (userData.total_contrib || 0) + parseInt(quantity)
        })
        .eq("user_id", parseInt(userId));
    }

    return NextResponse.json({
      success: true,
      contribution_id: contributionData.contribution_id,
      message: "Kontribusi berhasil ditambahkan!"
    }, { status: 201 });

  } catch (err: any) {
    console.error("Contribute error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Terjadi kesalahan"
    }, { status: 500 });
  }
}