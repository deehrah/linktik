import { v2 as cloudinary } from 'cloudinary';
import { logger } from './logger';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 */
export async function uploadToCloudinary(
  fileData: Buffer | string,
  options: {
    folder?: string;
    public_id?: string;
    resource_type?: 'image' | 'video' | 'raw' | 'auto';
    format?: 'png' | 'jpg' | 'svg' | 'pdf' | 'webp';
    quality?: 'auto' | 'best';
  } = {}
) {
  try {
    const {
      folder = 'linktik',
      resource_type = 'image',
      format = 'png',
      quality = 'auto',
    } = options;

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type,
          format,
          quality,
          public_id: options.public_id,
          secure: true,
          flags: 'progressive',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Write data to stream
      if (typeof fileData === 'string') {
        uploadStream.end(fileData);
      } else {
        uploadStream.end(fileData);
      }
    });

    logger.info('File uploaded to Cloudinary', { publicId: options.public_id });
    return result as any;
  } catch (error) {
    logger.error('Failed to upload to Cloudinary', { error });
    throw new Error('Failed to upload file to Cloudinary');
  }
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info('File deleted from Cloudinary', { publicId });
    return result;
  } catch (error) {
    logger.error('Failed to delete from Cloudinary', { error });
    throw new Error('Failed to delete file from Cloudinary');
  }
}

/**
 * Generate signed URL with transformation
 */
export function generateCloudinaryUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb' | 'pad' | 'lpad' | 'mpad' | 'auto';
    quality?: 'auto' | 'best';
    format?: 'png' | 'jpg' | 'svg' | 'pdf' | 'webp';
    gravity?: string;
    background?: string;
    overlay?: string;
    angle?: number | string;
    opacity?: number;
  } = {}
) {
  try {
    const url = cloudinary.url(publicId, {
      ...options,
      secure: true,
      sign_url: true,
      type: 'upload',
    });
    return url;
  } catch (error) {
    logger.error('Failed to generate Cloudinary URL', { error, publicId });
    throw new Error('Failed to generate URL');
  }
}

/**
 * Get Cloudinary resource info
 */
export async function getCloudinaryResourceInfo(publicId: string) {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    logger.error('Failed to get resource info from Cloudinary', { error, publicId });
    throw new Error('Failed to get resource information');
  }
}

/**
 * Batch delete from Cloudinary
 */
export async function batchDeleteFromCloudinary(publicIds: string[]) {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    logger.info('Batch files deleted from Cloudinary', { count: publicIds.length });
    return result;
  } catch (error) {
    logger.error('Failed to batch delete from Cloudinary', { error });
    throw new Error('Failed to batch delete files');
  }
}

export default cloudinary;
