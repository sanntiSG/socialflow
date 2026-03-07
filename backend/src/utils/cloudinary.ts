import cloudinary from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: async (req: any, file: Express.Multer.File) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: 'socialflow/scheduled',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi'],
    };
  },
});

export const upload = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

export const deleteFromCloudinary = async (publicId: string, resourceType: 'image' | 'video' = 'image') => {
  try {
    await cloudinary.v2.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Error eliminando archivo de Cloudinary:', error);
  }
};

export default cloudinary.v2;
