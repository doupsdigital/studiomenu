/** Allowlist de imagens aceitas em upload — exclui SVG de propósito (pode
 *  conter script embutido e é servido publicamente pelo bucket). */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function isAllowedImageType(mimeType: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(mimeType);
}
