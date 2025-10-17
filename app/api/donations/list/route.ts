// app/api/donations/list/route.ts
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch donations dengan urutan status
    const { data: donationsData, error: donationsError } = await supabase
      .from("donations")
      .select("*")
      .in("donation_status", ["in progress", "completed", "reported"])
      .order("donation_id", { ascending: false });

    if (donationsError) {
      console.error("List donations error:", donationsError);
      return NextResponse.json({
        success: false,
        error: donationsError.message
      }, { status: 500 });
    }

    // Fetch organizations
    const orgIds = donationsData.map(d => d.organization_id).filter(Boolean);
    const { data: orgsData, error: orgsError } = await supabase
      .from("organizations")
      .select("organization_id, organization_name")
      .in("organization_id", orgIds);

    if (orgsError) {
      console.error("List organizations error:", orgsError);
      return NextResponse.json({
        success: false,
        error: orgsError.message
      }, { status: 500 });
    }

    // Map organizations to donations dan sort by status
    const orgsMap = new Map(orgsData.map(org => [org.organization_id, org]));
    let donations = donationsData.map(donation => ({
      ...donation,
      organization: orgsMap.get(donation.organization_id) || { organization_name: "Unknown" }
    }));

    // Sort: in progress → completed → reported
    const statusOrder = { "in progress": 1, "completed": 2, "reported": 3 };
    donations.sort((a, b) => {
      const orderA = statusOrder[a.donation_status as keyof typeof statusOrder] || 999;
      const orderB = statusOrder[b.donation_status as keyof typeof statusOrder] || 999;
      return orderA - orderB;
    });

    return NextResponse.json({
      success: true,
      donations
    });

  } catch (err: any) {
    console.error("List donations error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Terjadi kesalahan"
    }, { status: 500 });
  }
}