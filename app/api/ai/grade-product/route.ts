// app/api/ai/grade-product/route.ts - FIXED VERSION
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface GradingResult {
  grade: 'A' | 'B' | 'C' | 'D';
  reason: string;
  details: {
    condition: string;
    defects: string[];
    wearability: string;
  };
}

// NAMED EXPORT untuk POST method
export async function POST(req: Request) {
  try {
    const { product_id } = await req.json();

    if (!product_id) {
      return NextResponse.json({ 
        success: false, 
        error: "Product ID required" 
      }, { status: 400 });
    }

    // Fetch product dengan semua foto
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('product_id, product_name, photo, category, material, size')
      .eq('product_id', parseInt(product_id))
      .single();

    if (fetchError || !product) {
      return NextResponse.json({ 
        success: false, 
        error: "Product tidak ditemukan" 
      }, { status: 404 });
    }

    // Parse photos with better error handling
    let photos: Record<string, string> = {};
    try {
      if (typeof product.photo === 'string') {
        // Check if it's a JSON string
        if (product.photo.startsWith('{')) {
          photos = JSON.parse(product.photo);
        } 
        // If it's just a URL (legacy format)
        else if (product.photo.startsWith('http')) {
          photos = { front: product.photo };
        }
      } else if (typeof product.photo === 'object' && product.photo !== null) {
        photos = product.photo;
      }
    } catch (e) {
      console.error('Photo parse error:', e);
      return NextResponse.json({ 
        success: false, 
        error: "Format foto tidak valid" 
      }, { status: 400 });
    }

    // Download semua foto untuk diproses
    const imageData: Array<{type: string, data: string}> = [];
    const photoTypes = ['front', 'back', 'detail', 'label', 'additional'];
    
    for (const type of photoTypes) {
      if (photos[type]) {
        try {
          // Fetch image from URL
          const response = await fetch(photos[type]);
          
          if (!response.ok) {
            console.error(`Failed to fetch ${type} photo:`, response.status);
            continue;
          }

          const arrayBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          
          imageData.push({
            type,
            data: base64
          });
        } catch (err) {
          console.error(`Error fetching ${type} photo:`, err);
          // Continue with other photos
        }
      }
    }

    if (imageData.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Tidak ada foto yang dapat diproses" 
      }, { status: 400 });
    }

    console.log(`Processing ${imageData.length} photos for product ${product_id}`);

    // Prepare prompt untuk Gemini
    const gradingPrompt = `
Kamu adalah sistem AI grading untuk pakaian bekas di marketplace eWear.
Tugasmu adalah menilai kondisi pakaian berdasarkan foto-foto yang diberikan.

KRITERIA GRADING:
- Grade A: Pakaian masih baru, belum pernah dipakai, memiliki tag harga/brand, tidak ada cacat sama sekali
- Grade B: Sudah pernah dipakai tapi kondisi sangat baik, tidak ada noda/kerusakan, warna masih cerah
- Grade C: Ada kerusakan ringan seperti noda kecil, benang lepas, kancing hilang, warna sedikit pudar
- Grade D: Rusak berat (robek besar, noda permanen, lubang, sangat lusuh) - TIDAK LAYAK DIJUAL

INFORMASI PRODUK:
- Nama: ${product.product_name}
- Kategori: ${product.category || 'Tidak disebutkan'}
- Material: ${product.material || 'Tidak disebutkan'}
- Size: ${product.size || 'Tidak disebutkan'}

FOTO YANG TERSEDIA:
${imageData.map(img => `- Foto ${img.type}`).join('\n')}

INSTRUKSI:
1. Analisis SEMUA foto dengan teliti
2. Perhatikan: kondisi kain, ada tidaknya noda, kerusakan, tag/label, jahitan, warna
3. Tentukan grade yang PALING AKURAT (A/B/C/D)
4. Berikan alasan spesifik

RESPONSE FORMAT (JSON):
{
  "grade": "A/B/C/D",
  "reason": "Penjelasan singkat kenapa dapat grade ini",
  "details": {
    "condition": "Deskripsi kondisi umum",
    "defects": ["daftar cacat jika ada"],
    "wearability": "Apakah masih layak pakai"
  }
}

PENTING: Response harus PURE JSON tanpa markdown atau text tambahan!
`;

    // Prepare multimodal content untuk Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const imageParts = imageData.map(img => ({
      inlineData: {
        data: img.data,
        mimeType: "image/png"
      }
    }));

    console.log('Calling Gemini API...');
    const result = await model.generateContent([
      gradingPrompt,
      ...imageParts
    ]);

    const responseText = result.response.text();
    console.log('Gemini response:', responseText);
    
    // Parse JSON response
    let gradingResult: GradingResult;
    try {
      // Clean response (remove markdown if any)
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      gradingResult = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseText);
      return NextResponse.json({ 
        success: false, 
        error: "AI response tidak valid",
        debug_response: responseText
      }, { status: 500 });
    }

    // Validate grade
    if (!['A', 'B', 'C', 'D'].includes(gradingResult.grade)) {
      return NextResponse.json({ 
        success: false, 
        error: "Grade tidak valid dari AI" 
      }, { status: 500 });
    }

    // Update product dengan grade
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        grade: gradingResult.grade,
        status: gradingResult.grade === 'D' ? 'unsold' : 'unsold' // D tetap unsold tapi bisa diberi note
      })
      .eq('product_id', parseInt(product_id));

    if (updateError) {
      console.error("Failed to update product grade:", updateError);
      throw updateError;
    }

    console.log(`Product ${product_id} graded as ${gradingResult.grade}`);

    return NextResponse.json({ 
      success: true,
      grade: gradingResult.grade,
      reason: gradingResult.reason,
      details: gradingResult.details,
      product_id: product_id
    });

  } catch (err: any) {
    console.error("AI Grading error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "Internal server error"
    }, { status: 500 });
  }
}

// NAMED EXPORT untuk GET method
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const product_id = searchParams.get('product_id');

    if (!product_id) {
      return NextResponse.json({ 
        success: false, 
        error: "Product ID required" 
      }, { status: 400 });
    }

    const { data: product, error } = await supabase
      .from('products')
      .select('grade, product_name')
      .eq('product_id', parseInt(product_id))
      .single();

    if (error || !product) {
      return NextResponse.json({ 
        success: false, 
        error: "Product tidak ditemukan" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      product_id,
      product_name: product.product_name,
      grade: product.grade,
      is_graded: product.grade !== null
    });

  } catch (err: any) {
    console.error("Check grading error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    }, { status: 500 });
  }
}