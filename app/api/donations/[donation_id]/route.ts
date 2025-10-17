// app/api/donations/[donation_id]/route.ts
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ donation_id: string }> }
) {
  try {
    const { donation_id } = await params;
    const donationId = donation_id;

    // Fetch donation
    const { data: donationData, error: donationError } = await supabase
      .from("donations")
      .select("*")
      .eq("donation_id", donationId)
      .single();

    if (donationError) {
      console.error("Get donation error:", donationError);
      return NextResponse.json({
        success: false,
        error: donationError.message
      }, { status: 500 });
    }

    if (!donationData) {
      return NextResponse.json({
        success: false,
        error: "Donasi tidak ditemukan"
      }, { status: 404 });
    }

    // Fetch organization
    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .select("organization_name")
      .eq("organization_id", donationData.organization_id)
      .single();

    if (orgError) {
      console.error("Get organization error:", orgError);
    }

    const donation = {
      ...donationData,
      organization: orgData || { organization_name: "Unknown" }
    };

    return NextResponse.json({
      success: true,
      donation
    });

  } catch (err: any) {
    console.error("Get donation error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Terjadi kesalahan"
    }, { status: 500 });
  }
}