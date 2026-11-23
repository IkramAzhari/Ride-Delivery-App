
const request = require('supertest');
const mongoose = require('mongoose');

process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/uberclone_test';

const app = require('../app');
const User = require('../models/User');

beforeAll(async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connection.asPromise();
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Auth API', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'rider'
  };

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    expect(res.body.success).toBe(true);
    expect(res.statusCode).toBe(200);
  });

  it('should not allow duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send(testUser);
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.body.error).toBeDefined();
    expect(res.statusCode).toBe(400);
  });

  it('should login an existing user', async () => {
    await request(app).post('/api/auth/register').send(testUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.body.token).toBeDefined();
    expect(res.statusCode).toBe(200);
  });

  it('should fail login with wrong password', async () => {
    await request(app).post('/api/auth/register').send(testUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' });
    expect(res.body.error).toBe('Invalid password');
    expect(res.statusCode).toBe(400);
  });
});
