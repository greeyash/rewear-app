// app/api/users/profile/route.ts
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: "User ID required"
      }, { status: 400 });
    }

    // Get user data from users table
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", parseInt(userId))
      .single();

    if (userError) {
      console.error("Get user error:", userError);
      return NextResponse.json({
        success: false,
        error: "User tidak ditemukan: " + userError.message
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        user_id: user.user_id,
        user_name: user.user_name,
        email: user.email,
        location: user.location,
        address: user.address,
        rating: user.rating,
        total_contrib: user.total_contrib,
        profile_photo_url: user.profile_photo_url,
        created_at: user.created_at
      }
    });

  } catch (err: any) {
    console.error("Get profile error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Terjadi kesalahan"
    }, { status: 500 });
  }
}

// PATCH - Update user profile
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { user_id, ...updates } = body;

    if (!user_id) {
      return NextResponse.json({
        success: false,
        error: "User ID required"
      }, { status: 400 });
    }

    // Update user data
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("user_id", parseInt(user_id))
      .select()
      .single();

    if (error) {
      console.error("Update user error:", error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      user: data,
      message: "Profile berhasil diupdate"
    });

  } catch (err: any) {
    console.error("Update profile error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Terjadi kesalahan"
    }, { status: 500 });
  }
}