import api from '@/lib/api';
import { GalleryImage } from '@/types/gallery';

const useGalleryImages = () => {
    const uploadImage = async (
        galleryId: number,
        file: File,
        onProgress: (pct: number) => void
    ): Promise<GalleryImage> => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post(`/api/admin/v1/galleries/${galleryId}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                const pct = Math.round((progressEvent.loaded * 100) / (progressEvent.total ?? 1));
                onProgress(pct);
            },
        });

        return response.data.content as GalleryImage;
    };

    const deleteImage = async (galleryId: number, imageId: number): Promise<void> => {
        await api.delete(`/api/admin/v1/galleries/${galleryId}/images/${imageId}`);
    };

    const reorderImages = async (
        galleryId: number,
        images: GalleryImage[]
    ): Promise<void> => {
        await api.put(`/api/admin/v1/galleries/${galleryId}/images/reorder`, {
            images: images.map((img) => ({ id: img.id, displayOrder: img.displayOrder })),
        });
    };

    return { uploadImage, deleteImage, reorderImages };
};

export default useGalleryImages;
