import { createClient } from '@supabase/supabase-js';

// Get the environment variables
// Use import.meta.env for Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mhxxtfxgdbhzywfqphsk.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Upload logo to Supabase Storage
export const uploadLogo = async (file: File, companyId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${companyId}_logo_${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('company-logos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
    if (error) {
      console.error('Error uploading logo:', error);
      return null;
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('company-logos')
      .getPublicUrl(fileName);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadLogo:', error);
    return null;
  }
};

// Get logo URL from Supabase Storage
export const getLogoUrl = (path: string): string | null => {
  if (!path) return null;
  
  const { data } = supabase.storage
    .from('company-logos')
    .getPublicUrl(path);
  
  return data.publicUrl;
}; 