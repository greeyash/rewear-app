// app/api/products/route.ts - FIXED VERSION
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
      quantity,
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
        quantity: parseInt(quantity) || 1,
        description: description || null,
        category: category || null,
        size: size || null,
        material: material || null,
        photo: photoData,
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

    // FIXED: Return proper response with product_id
    return NextResponse.json({ 
      success: true, 
      product_id: product.product_id, // <- IMPORTANT: Return product_id
      product: {
        ...product,
        photos: uploadedPhotos
      }
    }, { status: 201 });

  } catch (err: any) {
    console.error("Upload product error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "Internal server error"
    }, { status: 500 });
  }
}

// GET - Ambil semua products atau single product
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');
    const status = searchParams.get('status');
    const product_id = searchParams.get('product_id');

    let query = supabase
      .from('products')
      .select('*')
      .order('upload_date', { ascending: false });

    if (product_id) {
      query = query.eq('product_id', parseInt(product_id));
    }

    if (user_id) {
      query = query.eq('user_id', parseInt(user_id));
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Parse photo JSON untuk setiap product
    const products = (data || []).map(product => {
      let photos = null;
      
      if (product.photo) {
        try {
          // Check if it's already a JSON string
          if (typeof product.photo === 'string' && product.photo.startsWith('{')) {
            photos = JSON.parse(product.photo);
          } 
          // If it's just a URL string (legacy format)
          else if (typeof product.photo === 'string' && product.photo.startsWith('http')) {
            photos = { front: product.photo };
          }
          // If it's already an object
          else if (typeof product.photo === 'object') {
            photos = product.photo;
          }
        } catch (e) {
          console.error('Error parsing photo for product', product.product_id, e);
          // Fallback: treat as single URL
          photos = { front: product.photo };
        }
      }
      
      return {
        ...product,
        photos
      };
    });

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

// PATCH - Update product
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { product_id, ...updates } = body;

    if (!product_id) {
      return NextResponse.json({ 
        success: false,
        error: "Product ID required" 
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('product_id', parseInt(product_id))
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      product: data 
    });

  } catch (err: any) {
    console.error("Update product error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    }, { status: 500 });
  }
}