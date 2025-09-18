import { supabase } from '@/lib/supabase';

// Image upload utility functions
export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface ImageFile {
  file: File;
  preview: string;
}

// Validate image file
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: `${file.name} is not an image file` };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: `${file.name} is too large. Maximum size is 5MB` };
  }

  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(fileExtension)) {
    return { valid: false, error: `${file.name} has an unsupported format. Use JPG, PNG, GIF, or WebP` };
  }

  return { valid: true };
};

// Create preview URL for image
export const createImagePreview = (file: File): string => {
  return URL.createObjectURL(file);
};

// Clean up object URL
export const revokeImagePreview = (url: string): void => {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

// Process multiple files and create previews
export const processImageFiles = (files: FileList | null): { validFiles: File[]; previews: string[]; errors: string[] } => {
  if (!files) return { validFiles: [], previews: [], errors: [] };

  const validFiles: File[] = [];
  const previews: string[] = [];
  const errors: string[] = [];

  Array.from(files).forEach(file => {
    const validation = validateImageFile(file);
    if (validation.valid) {
      validFiles.push(file);
      previews.push(createImagePreview(file));
    } else {
      errors.push(validation.error || 'Invalid file');
    }
  });

  return { validFiles, previews, errors };
};

// Upload image to Supabase Storage (for future use)
export const uploadImageToSupabase = async (
  file: File, 
  bucket: string = 'product-images',
  folder: string = 'uploads'
): Promise<ImageUploadResult> => {
  try {
    // Check if Supabase is properly configured
    const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                                 import.meta.env.VITE_SUPABASE_ANON_KEY &&
                                 import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url' &&
                                 import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your_supabase_anon_key';

    if (!isSupabaseConfigured) {
      return { 
        success: false, 
        error: 'Supabase is not properly configured for file uploads' 
      };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return { 
        success: false, 
        error: `Upload failed: ${error.message}` 
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl
    };

  } catch (error: any) {
    console.error('Image upload error:', error);
    return { 
      success: false, 
      error: `Upload failed: ${error.message || 'Unknown error'}` 
    };
  }
};

// Upload multiple images to Supabase Storage
export const uploadMultipleImages = async (
  files: File[],
  bucket: string = 'product-images',
  folder: string = 'uploads',
  onProgress?: (progress: number) => void
): Promise<{ urls: string[]; errors: string[] }> => {
  const urls: string[] = [];
  const errors: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await uploadImageToSupabase(file, bucket, folder);
    
    if (result.success && result.url) {
      urls.push(result.url);
    } else {
      errors.push(result.error || `Failed to upload ${file.name}`);
    }

    // Report progress
    if (onProgress) {
      onProgress(((i + 1) / files.length) * 100);
    }
  }

  return { urls, errors };
};

// Compress image before upload (optional utility)
export const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Return original if compression fails
          }
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};