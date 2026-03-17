import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oyzyklamhzkaezhtajzc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_K9lxuzJ6R-6_qWc4T3I8sQ_WZSVLO_I';
const BUCKET = 'Foto-ferro';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Sube una imagen al bucket 'articulos' de Supabase Storage.
 * Devuelve la URL pública de la imagen subida.
 */
export const uploadArticuloImage = async (file: File, articuloId: number | string): Promise<string> => {
  const ext = file.name.split('.').pop();
  const path = `articulo_${articuloId}_${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  if (error) throw new Error(`Error al subir imagen: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Elimina una imagen del bucket dado su URL pública.
 */
export const deleteArticuloImage = async (url: string): Promise<void> => {
  if (!url) return;
  const parts = url.split(`${BUCKET}/`);
  const path = parts[1];
  if (!path) return;
  await supabase.storage.from(BUCKET).remove([path]);
};
