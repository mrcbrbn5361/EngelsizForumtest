import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', message: 'Admin access required.' }, { status: 403 });
    }

    // Generate Key
    const newKey = `sk_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Insert into DB (Assuming api_keys table exists)
    const { error: insertError } = await supabase.from('api_keys').insert({
        key: newKey,
        created_by: user.id,
        created_at: new Date().toISOString()
    });
    
    if (insertError) {
      if (insertError.code === '42P01') {
        return NextResponse.json({
          success: false,
          error: 'api_keys_missing',
          message: 'Veritabanında "api_keys" tablosu bulunamadı. Lütfen SQL kodunu Supabase panelinde çalıştırın.'
        }, { status: 400 });
      }
      throw insertError;
    }

    return NextResponse.json({ success: true, key: newKey });

  } catch (error: any) {
    console.error('API Key Creation Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'internal_error',
      message: error.message || 'Anahtar oluşturma sırasında bir hata oluştu.' 
    }, { status: 500 });
  }
}
