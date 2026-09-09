import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const slug = (formData.get('slug') as string) || 'common';
    const editToken = formData.get('edit_token') as string;

    if (!file) {
      return NextResponse.json({ success: false, message: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    if (!editToken) {
      return NextResponse.json({ success: false, message: 'Token de edição necessário para upload.' }, { status: 403 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, message: 'Apenas arquivos de imagem são permitidos.' }, { status: 400 });
    }

    const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, message: 'Imagem muito grande. O limite é 8MB.' }, { status: 400 });
    }

    // Validar token no Supabase
    const { data: order } = await supabase
      .from('orders')
      .select('id')
      .eq('slug', slug.toLowerCase().trim())
      .eq('edit_token', editToken)
      .single();

    if (!order) {
      return NextResponse.json({ success: false, message: 'Não autorizado para upload neste catálogo.' }, { status: 403 });
    }

    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${slug}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('catalog-assets')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('[API Catalog Upload Error]:', uploadError);
      return NextResponse.json({ success: false, message: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from('catalog-assets')
      .getPublicUrl(uploadData.path);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
    });
  } catch (err: any) {
    console.error('[API Upload Exception]:', err);
    return NextResponse.json({ success: false, message: err?.message || 'Erro no servidor.' }, { status: 500 });
  }
}
