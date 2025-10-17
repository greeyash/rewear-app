// app/api/products/[id]/route.ts
// @ts-nocheck
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json({
        success: false,
        error: "Invalid product ID"
      }, { status: 400 });
    }

    // Fetch product with seller info
    const { data, error } = await supabase
      .from('products')
      .select(`
        product_id,
        product_name,
        price,
        description,
        category,
        size,
        material,
        grade,
        status,
        quantity,
        photo,
        users:user_id (
          user_id,
          user_name,
          email,
          address,
          location,
          rating
        )
      `)
      .eq('product_id', productId)
      .single();

    if (error || !data) {
      console.error("Supabase error:", error);
      return NextResponse.json({
        success: false,
        error: "Product not found"
      }, { status: 404 });
    }

    // Parse photos
    let photos = null;
    if (data.photo) {
      try {
        if (typeof data.photo === 'string' && data.photo.startsWith('{')) {
          photos = JSON.parse(data.photo);
        } else if (typeof data.photo === 'string' && data.photo.startsWith('http')) {
          photos = { front: data.photo };
        } else if (typeof data.photo === 'object') {
          photos = data.photo;
        }
      } catch (e) {
        console.error('Error parsing photo:', e);
        photos = { front: data.photo };
      }
    }

    // Format response
    const product = {
      product_id: data.product_id,
      product_name: data.product_name,
      price: data.price,
      description: data.description,
      category: data.category,
      size: data.size,
      material: data.material,
      grade: data.grade,
      status: data.status,
      quantity: data.quantity,
      photos,
      seller: {
        user_id: data.users?.user_id || 0,
        user_name: data.users?.user_name || 'Unknown',
        email: data.users?.email || '',
        address: data.users?.address || '',
        location: data.users?.location || 'Unknown',
        rating: data.users?.rating || 0
      }
    };

    return NextResponse.json({
      success: true,
      product
    });

  } catch (err: any) {
    console.error("Get product detail error:", err);
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}