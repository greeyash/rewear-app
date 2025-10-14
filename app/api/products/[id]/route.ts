// app/api/products/[id]/route.ts
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    console.log('Fetching product with ID:', productId);

    const { data: product, error: productError } = await supabase
      .from("products")
      .select('*')
      .eq('product_id', productId)
      .single();

    console.log('Product query result:', { product, error: productError });

    if (productError) {
      console.error("Get product error:", productError);
      return NextResponse.json({ 
        success: false, 
        error: productError.message,
        details: productError
      }, { status: 404 });
    }

    if (!product) {
      return NextResponse.json({ 
        success: false, 
        error: "Product not found" 
      }, { status: 404 });
    }

    // Get seller info
    let seller = {};
    if (product.user_id) {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select('user_id, user_name, email, address, rating, location')
        .eq('user_id', product.user_id)
        .single();
      
      console.log('User query result:', { userData, error: userError });
      
      if (!userError && userData) {
        seller = userData;
      }
    }

    // Parse photos JSON
    let photos = {};
    try {
      photos = product.photo ? JSON.parse(product.photo) : {};
    } catch (e) {
      console.error('Error parsing photos:', e);
      photos = {};
    }

    const response = {
      product_id: product.product_id,
      product_name: product.product_name,
      price: product.price,
      description: product.description,
      category: product.category,
      size: product.size,
      material: product.material,
      grade: product.grade,
      status: product.status,
      quantity: product.quantity || 0,
      upload_date: product.upload_date,
      photos,
      seller
    };

    console.log('Sending response:', response);

    return NextResponse.json({ 
      success: true, 
      product: response
    });

  } catch (err: any) {
    console.error("Get product detail error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message,
      stack: err.stack
    }, { status: 500 });
  }
}

// PATCH - Update product
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await req.json();

    console.log('Updating product', productId, 'with:', body);

    // Validasi status jika ada
    const validStatuses = ['unsold', 'sold'];
    if (body.status && !validStatuses.includes(body.status)) {
      console.warn(`Invalid status: ${body.status}. Using 'unsold' instead.`);
      body.status = 'unsold'; // Default ke unsold jika status invalid
    }

    const { data, error } = await supabase
      .from("products")
      .update(body)
      .eq('product_id', parseInt(productId))
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      throw error;
    }

    console.log('Update successful:', data);

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

// DELETE product
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    // Get product first to delete photos
    const { data: product } = await supabase
      .from("products")
      .select('photo')
      .eq('product_id', productId)
      .single();

    if (product?.photo) {
      const photos = JSON.parse(product.photo);
      
      // Delete all photos from storage
      for (const url of Object.values(photos)) {
        const fileName = (url as string).split('/').pop();
        if (fileName) {
          await supabase.storage.from("product-photos").remove([fileName]);
        }
      }
    }

    // Delete product from database
    const { error } = await supabase
      .from("products")
      .delete()
      .eq('product_id', productId);

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: "Product deleted successfully" 
    });

  } catch (err: any) {
    console.error("Delete product error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    }, { status: 500 });
  }
}