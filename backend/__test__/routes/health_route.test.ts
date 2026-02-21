import request from 'supertest';

import server from '../../src/server/http_server';
import globalApiPath from '../../src/utils/global_api_path/global_api_path';

const apiPath = globalApiPath();

describe('CHECK HEALTH API ENDPOINT', () => {
    let app: any;

    beforeAll(async () => {
        const silent = true;
        app = await server(silent);
    });

    it(`GET ${apiPath}/v1/health should return status ok`, async () => {
        await request(app)
            .get(`${apiPath}/v1/health`)
            .expect(200)
            .then((response) => {
                expect(response.body).toEqual({ status: 'ok' });
            });
    });

    it(`GET ${apiPath}/v1/health should be accessible without authentication`, async () => {
        await request(app)
            .get(`${apiPath}/v1/health`)
            .expect(200);
    });

    it(`GET ${apiPath}/v1/health should have correct content type`, async () => {
        await request(app)
            .get(`${apiPath}/v1/health`)
            .expect('Content-Type', /json/)
            .expect(200);
    });

    afterAll(async () => {
        await app.close();
    });
});
