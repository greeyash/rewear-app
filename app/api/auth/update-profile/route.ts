// app/api/auth/update-profile/route.ts
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const formData = await req.formData();
    
    const user_id = formData.get("user_id") as string;
    const user_name = formData.get("user_name") as string;
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const location = formData.get("location") as string;
    const profilePhoto = formData.get("profile_photo") as File | null;

    // Validasi input
    if (!user_id) {
      return NextResponse.json({
        success: false,
        error: "User ID diperlukan"
      }, { status: 400 });
    }

    // Data yang akan diupdate
    const updateData: any = {};

    if (user_name) updateData.user_name = user_name;
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (location) updateData.location = location;

    // Handle upload foto profil jika ada
    if (profilePhoto && profilePhoto.size > 0) {
      try {
        // Generate unique filename
        const fileExt = profilePhoto.name.split('.').pop();
        const fileName = `${user_id}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Convert File to ArrayBuffer then to Buffer
        const arrayBuffer = await profilePhoto.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload ke Supabase Storage bucket 'photo-profile'
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('photo-profile')
          .upload(filePath, buffer, {
            contentType: profilePhoto.type,
            upsert: true
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          return NextResponse.json({
            success: false,
            error: "Gagal mengupload foto profil: " + uploadError.message
          }, { status: 500 });
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('photo-profile')
          .getPublicUrl(filePath);

        updateData.profile_photo_url = urlData.publicUrl;

        // Hapus foto lama jika ada
        const { data: userData } = await supabase
          .from("users")
          .select("profile_photo_url")
          .eq("user_id", user_id)
          .single();

        if (userData?.profile_photo_url) {
          // Extract filename from old URL
          const oldFileName = userData.profile_photo_url.split('/').pop();
          if (oldFileName) {
            await supabase.storage
              .from('photo-profile')
              .remove([oldFileName]);
          }
        }
      } catch (uploadErr: any) {
        console.error("Upload process error:", uploadErr);
        return NextResponse.json({
          success: false,
          error: "Gagal memproses foto profil"
        }, { status: 500 });
      }
    }

    // Update user data
    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("user_id", user_id)
      .select("user_id, email, user_name, name, address, location, profile_photo_url")
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
      user: data,
      message: "Profile berhasil diupdate"
    });

  } catch (err: any) {
    console.error("Update profile error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Terjadi kesalahan pada server"
    }, { status: 500 });
  }
}

// GET method untuk mengambil data profile
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json({
        success: false,
        error: "User ID diperlukan"
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("users")
      .select("user_id, email, user_name, name, address, location, profile_photo_url, rating, total_contrib")
      .eq("user_id", user_id)
      .single();

    if (error) {
      console.error("Get profile error:", error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({
        success: false,
        error: "User tidak ditemukan"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: data
    });

  } catch (err: any) {
    console.error("Get profile error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Terjadi kesalahan pada server"
    }, { status: 500 });
  }
}