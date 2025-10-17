// app/api/users/[id]/route.ts
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    console.log('Fetching user with ID:', userId);

    const { data: user, error: userError } = await supabase
      .from("users")
      .select('user_id, user_name, email, address, location, rating, total_contrib')
      .eq('user_id', userId)
      .single();

    if (userError) {
      console.error("Get user error:", userError);
      return NextResponse.json({ 
        success: false, 
        error: userError.message
      }, { status: 404 });
    }

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      user
    });

  } catch (err: any) {
    console.error("Get user error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message
    }, { status: 500 });
  }
}

// PATCH - Update user profile
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const body = await req.json();

    console.log('Updating user', userId, 'with:', body);

    // Don't allow updating password or email through this endpoint
    delete body.password;
    delete body.email;

    const { data, error } = await supabase
      .from("users")
      .update(body)
      .eq('user_id', parseInt(userId))
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      throw error;
    }

    console.log('Update successful:', data);

    return NextResponse.json({ 
      success: true, 
      user: data 
    });

  } catch (err: any) {
    console.error("Update user error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    }, { status: 500 });
  }
}