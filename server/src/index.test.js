import request from 'supertest';
import app from './index.js';

describe('GET /api/health', () => {
  it('should return 200 OK with status message', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      status: 'UP',
      message: 'Server is running',
    });
  });
});
