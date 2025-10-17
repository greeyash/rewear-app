// app/api/donations/list/route.ts
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
      .select("*")
      .in("donation_status", ["in progress", "completed", "reported"]);

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

    if (donationsError) {
      console.error("List donations error:", donationsError);
      return NextResponse.json({
        success: false,
        error: donationsError.message
      }, { status: 500 });
    }

    // Fetch organizations
    const orgIds = donationsData.map(d => d.organization_id).filter(Boolean);
    
    if (orgIds.length === 0) {
      return NextResponse.json({
        success: true,
        donations: []
      });
    }

    const { data: orgsData, error: orgsError } = await supabase
      .from("organizations")
      .select("organization_id, organization_name, organization_desc")
      .in("organization_id", orgIds);

    if (orgsError) {
      console.error("List organizations error:", orgsError);
      return NextResponse.json({
        success: false,
        error: orgsError.message
      }, { status: 500 });
    }

    // Map organizations to donations
    const orgsMap = new Map(orgsData.map(org => [org.organization_id, org]));
    let donations = donationsData.map(donation => ({
      ...donation,
      organization: orgsMap.get(donation.organization_id) || { 
        organization_id: null,
        organization_name: "Unknown",
        organization_desc: null
      }
    }));

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