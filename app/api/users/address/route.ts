// app/api/users/address/route.ts
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET - Get user address
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: "User ID required" 
      }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select('user_id, user_name, address, location')
      .eq('user_id', parseInt(userId))
      .single();

    if (error) {
      console.error("Get user address error:", error);
      throw error;
    }

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      user
    });

  } catch (err: any) {
    console.error("Get user address error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "Failed to get user address"
    }, { status: 500 });
  }
}

// PATCH - Update user address
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { user_id, address, location } = body;

    if (!user_id) {
      return NextResponse.json({ 
        success: false, 
        error: "User ID required" 
      }, { status: 400 });
    }

    if (!address || !location) {
      return NextResponse.json({ 
        success: false, 
        error: "Address and location are required" 
      }, { status: 400 });
    }

    // Validate address length
    if (address.trim().length < 10) {
      return NextResponse.json({ 
        success: false, 
        error: "Alamat terlalu pendek (minimal 10 karakter)" 
      }, { status: 400 });
    }

    if (location.trim().length < 3) {
      return NextResponse.json({ 
        success: false, 
        error: "Nama kota terlalu pendek" 
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("users")
      .update({ 
        address: address.trim(), 
        location: location.trim() 
      })
      .eq('user_id', parseInt(user_id))
      .select()
      .single();

    if (error) {
      console.error("Update user address error:", error);
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      user: data,
      message: "Alamat berhasil diperbarui"
    });

  } catch (err: any) {
    console.error("Update user address error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "Failed to update user address"
    }, { status: 500 });
  }
}