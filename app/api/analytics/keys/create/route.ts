import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Supabase client'ı başlat
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Kullanıcının admin olup olmadığını kontrol et
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', message: 'Admin access required.' }, { status: 403 });
    }

    // Güvenli ve tahmin edilemez bir anahtar üret
    const newKey = `sk_${crypto.randomUUID().replace(/-/g, '')}`;
    
    // Veritabanına kaydet
    const { error: insertError } = await supabase.from('api_keys').insert({
        key: newKey,
        created_by: user.id
    });
    
    if (insertError) {
      console.error('Database insertion error:', insertError);
      return NextResponse.json({ error: 'Database error', details: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, key: newKey });

  } catch (error: any) {
    console.error('API Key Creation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
