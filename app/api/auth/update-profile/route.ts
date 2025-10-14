// app/api/auth/update-profile/route.ts
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const { user_id, user_name } = await req.json();

    if (!user_id || !user_name) {
      return NextResponse.json({
        success: false,
        error: "User ID dan username diperlukan"
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("users")
      .update({ user_name })
      .eq("user_id", user_id)
      .select("user_id, email, user_name")
      .single();

    if (error) {
      console.error("Update profile error:", error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: data
    });

  } catch (err: any) {
    console.error("Update profile error:", err);
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}