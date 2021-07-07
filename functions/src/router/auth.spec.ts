import supertest from 'supertest';
import server from '../api';

const createServer = () => {
    return supertest(server);
};

describe('Authentication router', () => {
    describe('Register route', () => {
        it('should not allow blank submissions', async () => {
            const request = createServer();
            const response = await request.post('/auth/register');
            expect(response.status).toBe(400);
        });

        it('should not allow zip to be less than or greater than 5 ', async () => {
            const request = createServer();
            const response = await request.post('/auth/register').send({
                email: 'testEmail@test.com',
                password: '123testsuper',
                zip: '1234',
                name: 'test user',
                state: 'fl',
            });
            expect(response.status).toBe(500);
        });
    });
    describe('Login route', () => {
        it('should not allow blank submissions', async () => {
            const request = createServer();
            const response = await request.post('/auth/login');

            expect(response.status).toBe(400);
        });

        it('should return status of 404 with invalid information', async () => {
            const request = createServer();
            const response = await request
                .post('/auth/login')
                .send({ email: 'testemail@test.com', password: '123' });

            expect(response.status).toBe(404);
        });
    });
});
