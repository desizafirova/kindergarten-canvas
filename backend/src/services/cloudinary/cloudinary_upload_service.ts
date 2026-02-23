import cloudinary from '@config/cloudinary.config';
import logger from '@utils/logger/winston/logger';

interface UploadResult {
  success: boolean;
  data: {
    url: string;
    publicId: string;
  } | null;
  error: string | null;
}

export default async (fileBuffer: Buffer, filename: string, mimetype: string = 'image/jpeg'): Promise<UploadResult> => {
  try {
    // Convert buffer to base64 data URI for Cloudinary (use actual mimetype)
    const fileStr = `data:${mimetype};base64,${fileBuffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(fileStr, {
      folder: 'kindergarten-canvas/news',
      resource_type: 'image',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      transformation: [
        { quality: 'auto', fetch_format: 'auto' } // Auto-optimize
      ]
    });

    return {
      success: true,
      data: {
        url: result.secure_url, // HTTPS CDN URL
        publicId: result.public_id
      },
      error: null
    };
  } catch (error: any) {
    logger.error(`Cloudinary upload failed: ${error.message}`);
    return {
      success: false,
      data: null,
      error: error.message || 'Upload failed'
    };
  }
};
