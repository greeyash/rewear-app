// app/api/debug/fix-all-photos/route.ts
// One-time script to fix all existing products

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    // Fetch all products
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('product_id, product_name, photo');

    if (fetchError) {
      throw fetchError;
    }

    const results = {
      total: products?.length || 0,
      fixed: 0,
      already_correct: 0,
      errors: [] as any[]
    };

    for (const product of products || []) {
      try {
        // Check if photo needs fixing
        if (typeof product.photo === 'string' && product.photo.startsWith('http')) {
          // Convert to JSON object
          const photoObject = {
            front: product.photo
          };

          const { error: updateError } = await supabase
            .from('products')
            .update({ photo: JSON.stringify(photoObject) })
            .eq('product_id', product.product_id);

          if (updateError) {
            results.errors.push({
              product_id: product.product_id,
              error: updateError.message
            });
          } else {
            results.fixed++;
          }
        } else {
          results.already_correct++;
        }
      } catch (err: any) {
        results.errors.push({
          product_id: product.product_id,
          error: err.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      results
    });

  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    }, { status: 500 });
  }
}