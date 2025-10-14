// app/api/auth/login/route.ts
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"; // Perlu install: npm install bcryptjs

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: "Email dan password diperlukan"
      }, { status: 400 });
    }

    // Cari user berdasarkan email
    const { data: user, error: queryError } = await supabase
      .from("users")
      .select("user_id, email, password")
      .eq("email", email)
      .single();

    if (queryError) {
      console.error("Query error:", queryError);
      return NextResponse.json({
        success: false,
        error: "User tidak ditemukan"
      }, { status: 404 });
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User tidak ditemukan"
      }, { status: 404 });
    }

    // Validasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        error: "Password salah"
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user_id: user.user_id,
      email: user.email
    });

  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}