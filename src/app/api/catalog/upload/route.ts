import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isAllowedImageType } from '@/lib/file-validation';
import { optimizeImage } from '@/lib/image-optimize';

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

    if (!isAllowedImageType(file.type)) {
      return NextResponse.json({ success: false, message: 'Formato de imagem não suportado. Use JPG, PNG, WEBP ou GIF.' }, { status: 400 });
    }

    const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, message: 'Imagem muito grande. O limite é 8MB.' }, { status: 400 });
    }

    // Validar token no Supabase
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('slug', slug.toLowerCase().trim())
      .eq('edit_token', editToken)
      .single();

    if (!order) {
      return NextResponse.json({ success: false, message: 'Não autorizado para upload neste catálogo.' }, { status: 403 });
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const { buffer, contentType, ext } = await optimizeImage(rawBuffer, file.type);
    const fileName = `${slug}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('catalog-assets')
      .upload(fileName, buffer, {
        contentType,
        upsert: true,
        // Nome do arquivo já é único por upload (timestamp + sufixo aleatório
        // — nunca sobrescreve o mesmo caminho), então é seguro pedir pro
        // navegador guardar por 1 ano: nunca existe uma versão "velha" pra
        // mostrar por engano, e visitas seguintes ao catálogo (ou a troca de
        // uma foto por outra) não baixam essa imagem de novo.
        cacheControl: '31536000',
      });

    if (uploadError) {
      console.error('[API Catalog Upload Error]:', uploadError);
      return NextResponse.json({ success: false, message: 'Erro ao enviar a imagem. Tente novamente.' }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('catalog-assets')
      .getPublicUrl(uploadData.path);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
    });
  } catch (err: any) {
    console.error('[API Upload Exception]:', err);
    return NextResponse.json({ success: false, message: 'Erro no servidor ao enviar a imagem.' }, { status: 500 });
  }
}
