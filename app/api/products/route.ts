// app/api/products/route.ts
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      product_name, 
      user_id,
      price, 
      description,
      category,
      size,
      material,
      photos // { front, back, detail, label, additional }
    } = body;

    // Validasi input
    if (!product_name || !user_id || !price) {
      return NextResponse.json({ 
        success: false,
        error: "Nama produk, user ID, dan harga wajib diisi" 
      }, { status: 400 });
    }

    if (!photos?.front) {
      return NextResponse.json({ 
        success: false,
        error: "Foto tampak depan wajib diupload" 
      }, { status: 400 });
    }

    // Upload semua foto ke Supabase Storage
    const uploadedPhotos: Record<string, string> = {};
    const photoTypes = ['front', 'back', 'detail', 'label', 'additional'] as const;
    
    for (const type of photoTypes) {
      if (photos && photos[type]) {
        try {
          // Generate unique filename
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(7);
          const fileName = `${user_id}_${timestamp}_${random}_${type}.png`;
          
          // Decode base64
          const base64Data = photos[type];
          const buffer = Buffer.from(base64Data, 'base64');

          // Upload to storage
          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from("product-photos")
            .upload(fileName, buffer, { 
              contentType: "image/png",
              upsert: false
            });

          if (uploadError) {
            console.error(`Upload error (${type}):`, uploadError);
            throw new Error(`Gagal upload foto ${type}: ${uploadError.message}`);
          }

          // Get public URL
          const { data: urlData } = supabase
            .storage
            .from("product-photos")
            .getPublicUrl(fileName);
          
          uploadedPhotos[type] = urlData.publicUrl;

        } catch (photoError: any) {
          console.error(`Error processing photo ${type}:`, photoError);
          
          // Cleanup: delete already uploaded photos
          for (const uploadedType in uploadedPhotos) {
            const url = uploadedPhotos[uploadedType];
            const fileName = url.split('/').pop();
            if (fileName) {
              await supabase.storage.from("product-photos").remove([fileName]);
            }
          }
          
          return NextResponse.json({ 
            success: false,
            error: photoError.message 
          }, { status: 500 });
        }
      }
    }

    // Simpan semua URL foto sebagai JSON
    const photoData = JSON.stringify(uploadedPhotos);

    // Insert product ke database
    const { data: product, error: insertError } = await supabase
      .from("products")
      .insert({
        product_name,
        user_id: parseInt(user_id),
        price: parseFloat(price),
        description: description || null,
        category: category || null,
        size: size || null,
        material: material || null,
        photo: photoData, // Simpan sebagai JSON string
        status: "unsold",
        grade: null, // Akan di-set oleh AI
        upload_date: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      
      // Cleanup: delete uploaded photos
      for (const type in uploadedPhotos) {
        const url = uploadedPhotos[type];
        const fileName = url.split('/').pop();
        if (fileName) {
          await supabase.storage.from("product-photos").remove([fileName]);
        }
      }
      
      throw new Error(`Database error: ${insertError.message}`);
    }

    return NextResponse.json({ 
      success: true, 
      product: {
        ...product,
        photos: uploadedPhotos // Parsed photos untuk frontend
      }
    });

  } catch (err: any) {
    console.error("Upload product error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "Internal server error"
    }, { status: 500 });
  }
}

// GET - Ambil semua products
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('products')
      .select('*')
      .order('upload_date', { ascending: false });

    if (user_id) {
      query = query.eq('user_id', parseInt(user_id));
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Parse photo JSON untuk setiap product
    const products = data.map(product => ({
      ...product,
      photos: product.photo ? JSON.parse(product.photo) : null
    }));

    return NextResponse.json({ 
      success: true, 
      products 
    });

  } catch (err: any) {
    console.error("Get products error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    }, { status: 500 });
  }
}