// app/api/transactions/route.ts
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { buyer_id, seller_id, product_id, quantity, total_price } = body;

    // Validation
    if (!buyer_id || !seller_id || !product_id || !quantity || !total_price) {
      return NextResponse.json({ 
        success: false, 
        error: "All fields are required" 
      }, { status: 400 });
    }

    // Check product availability
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('quantity, status, price')
      .eq('product_id', parseInt(product_id))
      .single();

    if (productError || !product) {
      return NextResponse.json({ 
        success: false, 
        error: "Product tidak ditemukan" 
      }, { status: 404 });
    }

    if (product.status === 'sold') {
      return NextResponse.json({ 
        success: false, 
        error: "Product sudah terjual" 
      }, { status: 400 });
    }

    const parsedQuantity = parseInt(quantity);
    if (parsedQuantity > product.quantity) {
      return NextResponse.json({ 
        success: false, 
        error: "Stok produk tidak mencukupi" 
      }, { status: 400 });
    }

    // Create transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        buyer_id: parseInt(buyer_id),
        seller_id: parseInt(seller_id),
        product_id: parseInt(product_id),
        total_price: parseFloat(total_price),
        payment_status: 'pending'
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Transaction creation error:", transactionError);
      throw transactionError;
    }

    // Update product quantity
    const newQuantity = product.quantity - parsedQuantity;
    const newStatus = newQuantity <= 0 ? 'sold' : 'unsold';

    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        quantity: newQuantity,
        status: newStatus
      })
      .eq('product_id', parseInt(product_id));

    if (updateError) {
      console.error("Product update error:", updateError);
      // Rollback transaction if product update fails
      await supabase
        .from('transactions')
        .delete()
        .eq('transaction_id', transaction.transaction_id);
      
      throw updateError;
    }

    return NextResponse.json({ 
      success: true, 
      transaction,
      message: "Transaction created successfully"
    });

  } catch (err: any) {
    console.error("Create transaction error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "Failed to create transaction"
    }, { status: 500 });
  }
}

// GET - Get user transactions
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    const type = searchParams.get('type'); // 'buyer' or 'seller'

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: "User ID required" 
      }, { status: 400 });
    }

    let query = supabase
      .from('transactions')
      .select(`
        *,
        products (
          product_id,
          product_name,
          photo,
          price,
          category
        ),
        buyer:users!transactions_buyer_id_fkey (
          user_id,
          user_name,
          email
        ),
        seller:users!transactions_seller_id_fkey (
          user_id,
          user_name,
          email
        )
      `);

    if (type === 'buyer') {
      query = query.eq('buyer_id', parseInt(userId));
    } else if (type === 'seller') {
      query = query.eq('seller_id', parseInt(userId));
    } else {
      // Get both buyer and seller transactions
      query = query.or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
    }

    const { data: transactions, error } = await query.order('transaction_date', { ascending: false });

    if (error) {
      console.error("Get transactions error:", error);
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      transactions: transactions || []
    });

  } catch (err: any) {
    console.error("Get transactions error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "Failed to get transactions"
    }, { status: 500 });
  }
}