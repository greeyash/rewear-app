// app/api/donations/list/route.ts
// @ts-nocheck
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get("creator_id");
    const status = searchParams.get("status");

    // Build query
    let query = supabase
      .from("donations")
      .select("*");
      // SEMENTARA DIMATIKAN - uncomment kalau mau filter status
      // .in("donation_status", ["in progress", "completed", "reported"]);

    // Filter by creator (untuk profile page)
    if (creatorId) {
      query = query.eq("creator_id", parseInt(creatorId));
    }

    // Filter by status (opsional)
    if (status) {
      query = query.eq("donation_status", status);
    }

    query = query.order("donation_id", { ascending: false });

    const { data: donationsData, error: donationsError } = await query;

    console.log("Donations query result:", {
      count: donationsData?.length || 0,
      data: donationsData,
      error: donationsError
    });

    if (donationsError) {
      console.error("List donations error:", donationsError);
      return NextResponse.json({
        success: false,
        error: donationsError.message
      }, { status: 500 });
    }

    // Fetch organizations
    const orgIds = donationsData.map(d => d.organization_id).filter(Boolean);
    
    let orgsMap = new Map();
    
    // Hanya fetch organizations jika ada orgIds
    if (orgIds.length > 0) {
      const { data: orgsData, error: orgsError } = await supabase
        .from("organizations")
        .select("organization_id, organization_name, organization_desc")
        .in("organization_id", orgIds);

      if (orgsError) {
        console.error("List organizations error:", orgsError);
      } else {
        orgsMap = new Map(orgsData.map(org => [org.organization_id, org]));
      }
    }

    // Map organizations to donations
    let donations = donationsData.map(donation => ({
      ...donation,
      organization: orgsMap.get(donation.organization_id) || { 
        organization_id: null,
        organization_name: donation.donation_target || "Unknown",
        organization_desc: null
      }
    }));

    // Sort by status: in progress → completed → reported
    const statusOrder = { "in progress": 1, "completed": 2, "reported": 3 };
    donations.sort((a, b) => {
      const orderA = statusOrder[a.donation_status] || 999;
      const orderB = statusOrder[b.donation_status] || 999;
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