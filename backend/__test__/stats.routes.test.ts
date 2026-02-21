/**
 * Stats Routes API Tests
 * Tests for /api/v1/stats/content-counts endpoint
 */

import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import server from '../src/server/http_server';

let app: any;
let authToken: string | null = null;

// Helper to ensure auth token is available - fails test if not
const requireAuthToken = (): string => {
    if (!authToken) {
        throw new Error(
            'Auth token not available - login failed in beforeAll. Check test user credentials.',
        );
    }
    return authToken;
};

beforeAll(async () => {
    // Start server silently for testing
    const silent = true;
    app = await server(silent);

    // Login to get auth token
    const loginResponse = await request(app).post('/api/client/auth/login').send({
        email: 'admin@test.com',
        password: 'password123',
    });

    if (loginResponse.body.success && loginResponse.body.content?.accessToken) {
        authToken = loginResponse.body.content.accessToken;
    }
});

afterAll(async () => {
    if (app) {
        await new Promise<void>((resolve) => {
            app.close(() => resolve());
        });
    }
});

describe('GET /api/v1/stats/content-counts', () => {
    it('should return 401 without authentication', async () => {
        const response = await request(app).get('/api/v1/stats/content-counts');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    it('should return expected structure with authentication', async () => {
        const token = requireAuthToken();

        const response = await request(app)
            .get('/api/v1/stats/content-counts')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('content');
    });

    it('should return all 6 content types with counts', async () => {
        const token = requireAuthToken();

        const response = await request(app)
            .get('/api/v1/stats/content-counts')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        const { content } = response.body;

        // Check all 6 content types exist
        expect(content).toHaveProperty('news');
        expect(content).toHaveProperty('careers');
        expect(content).toHaveProperty('events');
        expect(content).toHaveProperty('deadlines');
        expect(content).toHaveProperty('gallery');
        expect(content).toHaveProperty('teachers');

        // Check each has draft and published counts
        ['news', 'careers', 'events', 'deadlines', 'gallery', 'teachers'].forEach((type) => {
            expect(content[type]).toHaveProperty('draft');
            expect(content[type]).toHaveProperty('published');
            expect(typeof content[type].draft).toBe('number');
            expect(typeof content[type].published).toBe('number');
        });
    });

    it('should return valid JSON response', async () => {
        const token = requireAuthToken();

        const response = await request(app)
            .get('/api/v1/stats/content-counts')
            .set('Authorization', `Bearer ${token}`);

        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.status).toBe(200);
    });

    it('should return real news counts and mock data for other types', async () => {
        const token = requireAuthToken();

        const response = await request(app)
            .get('/api/v1/stats/content-counts')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        const { content } = response.body;

        // News counts come from real database (may be 0 or more)
        expect(typeof content.news.draft).toBe('number');
        expect(typeof content.news.published).toBe('number');
        expect(content.news.draft).toBeGreaterThanOrEqual(0);
        expect(content.news.published).toBeGreaterThanOrEqual(0);

        // Other content types still return mock zeros (until future stories implement them)
        ['careers', 'events', 'deadlines', 'gallery', 'teachers'].forEach((type) => {
            expect(content[type].draft).toBe(0);
            expect(content[type].published).toBe(0);
        });
    });
});
