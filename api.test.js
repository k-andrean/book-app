const request = require('supertest');
const app = require('./server');
// Import your Express app
describe('GET /books', () => {
  it('should return all books', async () => {
    const res = await request(app).get('/books');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});
