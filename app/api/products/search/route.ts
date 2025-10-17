// app/api/products/search/route.ts
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const grade = searchParams.get('grade');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    // Start building query - FIX: Gunakan syntax yang benar
    let dbQuery = supabase
      .from('products')
      .select(`
        product_id,
        product_name,
        description,
        price,
        grade,
        photo,
        status,
        category,
        users:user_id (
          user_name,
          location
        )
      `)
      .eq('status', 'unsold')
      .order('upload_date', { ascending: false });

    // Search by product name or description
    if (query) {
      dbQuery = dbQuery.or(`product_name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    // Filter by grade
    if (grade) {
      dbQuery = dbQuery.eq('grade', grade);
    }

    // Filter by price range
    if (minPrice) {
      dbQuery = dbQuery.gte('price', parseFloat(minPrice));
    }
    if (maxPrice) {
      dbQuery = dbQuery.lte('price', parseFloat(maxPrice));
    }

    const { data, error } = await dbQuery;

    if (error) {
      console.error("Supabase query error:", error);
      throw error;
    }

    // Transform data
    const products = (data || []).map((product: any) => {
      let photos = null;
      
      // Parse photo field
      if (product.photo) {
        try {
          if (typeof product.photo === 'string' && product.photo.startsWith('{')) {
            photos = JSON.parse(product.photo);
          } else if (typeof product.photo === 'string' && product.photo.startsWith('http')) {
            photos = { front: product.photo };
          } else if (typeof product.photo === 'object') {
            photos = product.photo;
          }
        } catch (e) {
          console.error('Error parsing photo for product', product.product_id, e);
          photos = { front: product.photo };
        }
      }
      
      return {
        product_id: product.product_id,
        product_name: product.product_name,
        description: product.description,
        price: product.price,
        grade: product.grade,
        photos,
        status: product.status,
        category: product.category,
        seller: {
          user_name: product.users?.user_name || 'Unknown',
          location: product.users?.location || 'Unknown'
        }
      };
    });

    return NextResponse.json({ 
      success: true, 
      products,
      count: products.length
    });

  } catch (err: any) {
    console.error("Search products error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    }, { status: 500 });
  }
}