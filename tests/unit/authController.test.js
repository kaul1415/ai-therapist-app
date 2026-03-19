const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');

describe('Auth Controller', () => {
  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toEqual('test@example.com');
    });

    it('should not register user with duplicate email', async () => {
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User 2',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('User already exists');
    });
  });

  // More tests for login, profile, etc.
});
