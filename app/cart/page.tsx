// app/api/cart/route.ts
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET - Ambil cart user
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: "User ID required" 
      }, { status: 400 });
    }

    // Get or create cart untuk user
    let { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('cart_id')
      .eq('user_id', parseInt(userId))
      .maybeSingle();

    if (cartError) {
      console.error("Cart fetch error:", cartError);
      throw cartError;
    }

    if (!cart) {
      // Create cart kalau belum ada
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({ user_id: parseInt(userId) })
        .select('cart_id')
        .single();

      if (createError) {
        console.error("Cart creation error:", createError);
        throw createError;
      }
      cart = newCart;
    }

    // Get cart items dengan product details
    const { data: cartItemsData, error: itemsError } = await supabase
      .from('cart_items')
      .select(`
        cart_item_id,
        quantity,
        products (
          product_id,
          product_name,
          photo,
          price,
          grade,
          status,
          category,
          size,
          quantity,
          user_id
        )
      `)
      .eq('cart_id', cart.cart_id);

    if (itemsError) {
      console.error("Cart items fetch error:", itemsError);
      throw itemsError;
    }

    // Format items - parse photos JSON
    const items = (cartItemsData || [])
      .filter((item: any) => item.products) // Filter out items tanpa product
      .map((item: any) => {
        const product = item.products;
        
        // Parse photos - bisa JSON object atau string URL
        let photos = {};
        if (product.photo) {
          try {
            // Coba parse sebagai JSON
            photos = typeof product.photo === 'string' 
              ? JSON.parse(product.photo) 
              : product.photo;
          } catch (e) {
            // Kalau gagal parse, berarti URL string langsung
            photos = { front: product.photo };
          }
        }
        
        return {
          cart_item_id: item.cart_item_id,
          quantity: item.quantity,
          products: {
            product_id: product.product_id,
            product_name: product.product_name,
            price: product.price,
            grade: product.grade,
            status: product.status,
            category: product.category,
            size: product.size,
            quantity: product.quantity,
            photos
          }
        };
      });

    return NextResponse.json({ 
      success: true, 
      cart_id: cart.cart_id,
      items 
    });

  } catch (err: any) {
    console.error("Get cart error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "Failed to fetch cart"
    }, { status: 500 });
  }
}

// POST - Tambah item ke cart
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, product_id, quantity } = body;

    // Validation
    if (!user_id || !product_id || !quantity) {
      return NextResponse.json({ 
        success: false, 
        error: "User ID, Product ID, dan quantity required" 
      }, { status: 400 });
    }

    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Quantity harus lebih dari 0" 
      }, { status: 400 });
    }

    // Check product stock dan status
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('quantity, status')
      .eq('product_id', parseInt(product_id))
      .maybeSingle();

    if (productError) {
      console.error("Product fetch error:", productError);
      throw productError;
    }

    if (!product) {
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

    const availableStock = product.quantity || 0;

    if (parsedQuantity > availableStock) {
      return NextResponse.json({ 
        success: false, 
        error: "Stok produk tidak mencukupi",
        available: availableStock
      }, { status: 400 });
    }

    // Get or create cart
    let { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('cart_id')
      .eq('user_id', parseInt(user_id))
      .maybeSingle();

    if (cartError) {
      console.error("Cart fetch error:", cartError);
      throw cartError;
    }

    if (!cart) {
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({ user_id: parseInt(user_id) })
        .select('cart_id')
        .single();

      if (createError) {
        console.error("Cart creation error:", createError);
        throw createError;
      }
      cart = newCart;
    }

    // Check if product already in cart
    const { data: existing, error: existingError } = await supabase
      .from('cart_items')
      .select('cart_item_id, quantity')
      .eq('cart_id', cart.cart_id)
      .eq('product_id', parseInt(product_id))
      .maybeSingle();

    if (existingError) {
      console.error("Existing cart item check error:", existingError);
      throw existingError;
    }

    if (existing) {
      const newQuantity = existing.quantity + parsedQuantity;
      
      // Check total quantity against stock
      if (newQuantity > availableStock) {
        return NextResponse.json({ 
          success: false, 
          error: "Jumlah total melebihi stok yang tersedia",
          available: availableStock,
          currentInCart: existing.quantity
        }, { status: 400 });
      }

      // Update quantity
      const { data, error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('cart_item_id', existing.cart_item_id)
        .select()
        .single();

      if (updateError) {
        console.error("Cart item update error:", updateError);
        throw updateError;
      }

      return NextResponse.json({ 
        success: true, 
        message: "Quantity berhasil diupdate",
        cart_item: data 
      });
    } else {
      // Insert new cart item
      const { data, error: insertError } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cart.cart_id,
          product_id: parseInt(product_id),
          quantity: parsedQuantity
        })
        .select()
        .single();

      if (insertError) {
        console.error("Cart item insert error:", insertError);
        throw insertError;
      }

      return NextResponse.json({ 
        success: true, 
        message: "Item berhasil ditambahkan ke cart",
        cart_item: data 
      });
    }

  } catch (err: any) {
    console.error("Add to cart error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "Failed to add item to cart"
    }, { status: 500 });
  }
}

// PATCH - Update quantity item di cart
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { cart_item_id, quantity } = body;

    if (!cart_item_id || !quantity) {
      return NextResponse.json({ 
        success: false, 
        error: "Cart item ID dan quantity required" 
      }, { status: 400 });
    }

    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Quantity harus lebih dari 0" 
      }, { status: 400 });
    }

    // Get cart item dengan product info
    const { data: cartItem, error: fetchError } = await supabase
      .from('cart_items')
      .select(`
        cart_item_id,
        product_id,
        products (quantity, status)
      `)
      .eq('cart_item_id', parseInt(cart_item_id))
      .single();

    if (fetchError || !cartItem) {
      return NextResponse.json({ 
        success: false, 
        error: "Cart item tidak ditemukan" 
      }, { status: 404 });
    }

    const product = cartItem.products as any;

    // Check product status dan stock
    if (product.status === 'sold') {
      return NextResponse.json({ 
        success: false, 
        error: "Product sudah terjual" 
      }, { status: 400 });
    }

    const availableStock = product.quantity || 0;
    if (parsedQuantity > availableStock) {
      return NextResponse.json({ 
        success: false, 
        error: "Stok produk tidak mencukupi",
        available: availableStock
      }, { status: 400 });
    }

    // Update quantity
    const { data, error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity: parsedQuantity })
      .eq('cart_item_id', parseInt(cart_item_id))
      .select()
      .single();

    if (updateError) {
      console.error("Update cart item error:", updateError);
      throw updateError;
    }

    return NextResponse.json({ 
      success: true, 
      message: "Quantity berhasil diupdate",
      cart_item: data 
    });

  } catch (err: any) {
    console.error("Update cart item error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "Failed to update cart item"
    }, { status: 500 });
  }
}

// DELETE - Hapus item dari cart
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get('cart_item_id');

    if (!cartItemId) {
      return NextResponse.json({ 
        success: false, 
        error: "Cart item ID required" 
      }, { status: 400 });
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_item_id', parseInt(cartItemId));

    if (error) {
      console.error("Delete cart item error:", error);
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      message: "Item berhasil dihapus dari cart" 
    });

  } catch (err: any) {
    console.error("Delete cart item error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "Failed to delete cart item"
    }, { status: 500 });
  }
}