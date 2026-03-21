export const GALLERY_IMAGE_SELECT = {
    id: true,
    imageUrl: true,
    thumbnailUrl: true,
    altText: true,
    displayOrder: true,
    createdAt: true,
} as const;

export const GALLERY_LIST_SELECT = {
    id: true,
    title: true,
    description: true,
    coverImageUrl: true,
    status: true,
    publishedAt: true,
    createdAt: true,
    updatedAt: true,
    _count: {
        select: { images: true },
    },
} as const;

export const GALLERY_DETAIL_SELECT = {
    id: true,
    title: true,
    description: true,
    coverImageUrl: true,
    status: true,
    publishedAt: true,
    createdAt: true,
    updatedAt: true,
    images: {
        select: {
            id: true,
            imageUrl: true,
            thumbnailUrl: true,
            altText: true,
            displayOrder: true,
            createdAt: true,
        },
        orderBy: { displayOrder: 'asc' as const },
    },
} as const;
