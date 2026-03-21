export interface GalleryImage {
    id: number;
    imageUrl: string;
    thumbnailUrl: string | null;
    altText: string | null;
    displayOrder: number;
    createdAt: string;
}

export interface Gallery {
    id: number;
    title: string;
    description: string | null;
    coverImageUrl: string | null;
    status: 'DRAFT' | 'PUBLISHED';
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    imageCount: number;
}

export interface GalleryDetail {
    id: number;
    title: string;
    description: string | null;
    coverImageUrl: string | null;
    status: 'DRAFT' | 'PUBLISHED';
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    images: GalleryImage[];
}

export interface PublicGallery {
    id: number;
    title: string;
    description: string | null;
    coverImageUrl: string | null;
    imageCount: number;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface PublicGalleryDetail {
    id: number;
    title: string;
    description: string | null;
    coverImageUrl: string | null;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    images: GalleryImage[];
}
