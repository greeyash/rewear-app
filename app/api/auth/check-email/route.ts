// app/api/auth/check-email/route.ts
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({
        success: false,
        error: "Email diperlukan"
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("users")
      .select("user_id")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Check email error:", error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }   

    // PGRST116 = no rows returned
    const exists = data !== null;

    return NextResponse.json({
      exists
    });

  } catch (err: any) {
    console.error("Check email error:", err);
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}
