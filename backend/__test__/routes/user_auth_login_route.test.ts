import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import config from '../../src/config/app';
import server from '../../src/server/http_server';
import prisma from '../../prisma/prisma-client';
import globalApiPath from '../../src/utils/global_api_path/global_api_path';
import constError from '../../src/constants/error_constant';

const apiPath = globalApiPath();
const saltRounds = config.bcrypt.saltRounds;

describe('CHECK USER AUTH API ENDPOINTS', () => {
    let app: any;
    const testEmail = 'test-login@sample.com';
    const password = '12341234';

    beforeAll(async () => {
        jest.setTimeout(60000);

        const silent = true;
        app = await server(silent);

        // Clean up any existing test user
        await prisma.user.deleteMany({ where: { email: testEmail } });

        // Create test user
        await prisma.user.create({
            data: {
                email: testEmail,
                password: bcrypt.hashSync(password, saltRounds),
                role: 'ADMIN',
            },
        });
    });

    afterAll(async () => {
        // Clean up test user
        await prisma.user.deleteMany({ where: { email: testEmail } });
        await prisma.$disconnect();
        await app.close();
    });

    describe('POST /api/v1/client/auth/login', () => {
        it('should return 200 with tokens for valid credentials', async () => {
            const response = await request(app)
                .post(`${apiPath}/client/auth/login`)
                .send({ email: testEmail, password: password })
                .expect(200);

            expect(response.body).toEqual(
                expect.objectContaining({
                    success: true,
                    message: 'Success',
                }),
            );
            expect(response.body.content).toHaveProperty('accessToken');
            expect(response.body.content).toHaveProperty('refreshToken');
            expect(response.body.content).toHaveProperty('user');
            expect(response.body.content.user).toEqual(
                expect.objectContaining({
                    email: testEmail,
                    role: 'ADMIN',
                }),
            );
            // Ensure password is not returned
            expect(response.body.content.user).not.toHaveProperty('password');
        });

        it('should return 401 for invalid password', async () => {
            const response = await request(app)
                .post(`${apiPath}/client/auth/login`)
                .send({ email: testEmail, password: 'wrongpassword' })
                .expect(401);

            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                }),
            );
        });

        it('should return 401 for unknown email', async () => {
            const response = await request(app)
                .post(`${apiPath}/client/auth/login`)
                .send({ email: 'unknown@sample.com', password: password })
                .expect(401);

            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                }),
            );
        });

        it('should return 400 for missing email', async () => {
            const response = await request(app)
                .post(`${apiPath}/client/auth/login`)
                .send({ password: password })
                .expect(400);

            // Validation error returns an array
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body[0]).toEqual(
                expect.objectContaining({
                    success: false,
                    error: 'VALIDATION_ERROR',
                }),
            );
        });

        it('should return 400 for missing password', async () => {
            const response = await request(app)
                .post(`${apiPath}/client/auth/login`)
                .send({ email: testEmail })
                .expect(400);

            // Validation error returns an array
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body[0]).toEqual(
                expect.objectContaining({
                    success: false,
                    error: 'VALIDATION_ERROR',
                }),
            );
        });
    });

    describe('POST /api/v1/client/auth/refresh', () => {
        let validRefreshToken: string;

        beforeAll(async () => {
            // Get a valid refresh token by logging in
            const loginResponse = await request(app)
                .post(`${apiPath}/client/auth/login`)
                .send({ email: testEmail, password: password });
            validRefreshToken = loginResponse.body.content.refreshToken;
        });

        it('should return 200 with new access token for valid refresh token', async () => {
            const response = await request(app)
                .post(`${apiPath}/client/auth/refresh`)
                .send({ refreshToken: validRefreshToken })
                .expect(200);

            expect(response.body).toEqual(
                expect.objectContaining({
                    success: true,
                }),
            );
            expect(response.body.content).toHaveProperty('accessToken');
        });

        it('should return 401 for invalid refresh token', async () => {
            const response = await request(app)
                .post(`${apiPath}/client/auth/refresh`)
                .send({ refreshToken: 'invalid-token' })
                .expect(401);

            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                }),
            );
        });

        it('should return 401 with session expired message for expired refresh token (AC2)', async () => {
            // Create an expired refresh token (expired 1 second ago)
            const expiredRefreshToken = jwt.sign(
                { userId: 1, type: 'refresh' },
                config.jwt.secretAdmin,
                { expiresIn: '-1s' }
            );

            const response = await request(app)
                .post(`${apiPath}/client/auth/refresh`)
                .send({ refreshToken: expiredRefreshToken })
                .expect(401);

            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    message: constError.TOKEN_MSG.sessionExpired,
                }),
            );
        });

        it('should return 401 when using access token instead of refresh token', async () => {
            // Create a valid access token (wrong type for refresh endpoint)
            const accessToken = jwt.sign(
                { userId: 1, email: 'test@example.com', role: 'ADMIN' },
                config.jwt.secretAdmin,
                { expiresIn: '1h' }
            );

            const response = await request(app)
                .post(`${apiPath}/client/auth/refresh`)
                .send({ refreshToken: accessToken })
                .expect(401);

            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    message: constError.TOKEN_MSG.invalidRefreshToken,
                }),
            );
        });

        it('should return 400 for missing refresh token', async () => {
            const response = await request(app)
                .post(`${apiPath}/client/auth/refresh`)
                .send({})
                .expect(400);

            // Validation error returns an array
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body[0]).toEqual(
                expect.objectContaining({
                    success: false,
                    error: 'VALIDATION_ERROR',
                }),
            );
        });
    });

    describe('POST /api/v1/client/auth/logout', () => {
        let validAccessToken: string;

        beforeAll(async () => {
            // Get a valid access token by logging in
            const loginResponse = await request(app)
                .post(`${apiPath}/client/auth/login`)
                .send({ email: testEmail, password: password });
            validAccessToken = loginResponse.body.content.accessToken;
        });

        it('should return 200 for valid logout', async () => {
            const response = await request(app)
                .post(`${apiPath}/client/auth/logout`)
                .set('Authorization', `Bearer ${validAccessToken}`)
                .send({})
                .expect(200);

            expect(response.body).toEqual(
                expect.objectContaining({
                    success: true,
                }),
            );
        });

        it('should return 401 with unauthorized access message for logout without token (AC4)', async () => {
            const response = await request(app)
                .post(`${apiPath}/client/auth/logout`)
                .send({})
                .expect(401);

            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    message: constError.TOKEN_MSG.unauthorizedAccess,
                }),
            );
        });

        it('should return 401 with unauthorized access message for invalid token (AC4)', async () => {
            const response = await request(app)
                .post(`${apiPath}/client/auth/logout`)
                .set('Authorization', 'Bearer invalid-token-here')
                .send({})
                .expect(401);

            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    message: constError.TOKEN_MSG.unauthorizedAccess,
                }),
            );
        });
    });
});
