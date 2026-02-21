// Role enum matching Prisma schema
export enum NewsStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
}

// NewsItem interface matching Prisma schema
export interface NewsItem {
    id: number;
    title: string;
    content: string;
    imageUrl: string | null;
    status: NewsStatus;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
