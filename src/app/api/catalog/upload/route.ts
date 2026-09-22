import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isAllowedImageType } from '@/lib/file-validation';

/** Redimensiona/reconverte pra WebP no servidor — rede de segurança atrás da
 *  compressão que já roda no navegador (`compressImageFile`): garante que
 *  nenhuma imagem grande entra no Storage mesmo se o cliente pular essa
 *  etapa (upload direto pela API, navegador sem suporte a canvas grande,
 *  etc). GIF passa direto (pode ser animado — `sharp` achataria pro 1º
 *  frame). Qualquer falha aqui devolve o buffer original: melhor subir sem
 *  comprimir do que travar o upload da profissional. */
async function optimizeImage(buffer: Buffer, contentType: string): Promise<{ buffer: Buffer; contentType: string; ext: string }> {
  if (contentType === 'image/gif') {
    return { buffer, contentType, ext: 'gif' };
  }
  try {
    const optimized = await sharp(buffer)
      .rotate() // aplica a orientação EXIF (fotos de celular) antes de medir/redimensionar
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    return { buffer: optimized, contentType: 'image/webp', ext: 'webp' };
  } catch (error) {
    console.warn('[API Catalog Upload] Falha ao otimizar, usando original:', error);
    const ext = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
    return { buffer, contentType, ext };
  }
}

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
