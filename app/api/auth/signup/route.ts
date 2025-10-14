// app/api/auth/signup/route.ts
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, user_name } = body;

    console.log('Signup request:', { email, user_name });

    if (!email || !password || !user_name) {
      return NextResponse.json({
        success: false,
        error: "Email, password, dan nama diperlukan"
      }, { status: 400 });
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed');

    // Insert user baru
    console.log('Inserting user to database...');
    const { data, error } = await supabase
      .from("users")
      .insert({
        email,
        password: hashedPassword,
        user_name,
        address: null,
        rating: null,
        location: null,
        total_contrib: 0
      })
      .select("user_id, email, user_name")
      .single();

    console.log('Insert response:', { data, error });

    if (error) {
      console.error("Signup error:", error);
      
      // Cek apakah email sudah terdaftar
      if (error.code === "23505") {
        return NextResponse.json({
          success: false,
          error: "Email sudah terdaftar"
        }, { status: 400 });
      }

      return NextResponse.json({
        success: false,
        error: error.message || "Gagal mendaftar"
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({
        success: false,
        error: "Data tidak dikembalikan dari database"
      }, { status: 500 });
    }

    console.log('User created successfully:', data);

    return NextResponse.json({
      success: true,
      user_id: data.user_id,
      email: data.email,
      user_name: data.user_name
    }, { status: 201 });

  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Terjadi kesalahan"
    }, { status: 500 });
  }
}