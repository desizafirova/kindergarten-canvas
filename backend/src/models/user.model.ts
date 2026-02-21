// Role enum matching Prisma schema
export enum Role {
    ADMIN = 'ADMIN',
    DEVELOPER = 'DEVELOPER',
}

// User interface matching Prisma schema
export interface User {
    id: number;
    email: string;
    password: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
}
