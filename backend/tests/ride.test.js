const request = require('supertest');
const mongoose = require('mongoose');

jest.mock('../services/fareService', () => ({
  calculateTripFare: jest.fn().mockResolvedValue({
    distanceKm: 10,
    estimatedFare: 20,
    minimumFare: 17,
    currency: 'LYD',
  }),
}));

const app = require('../app');
const User = require('../models/User');
const Ride = require('../models/Ride');

let riderToken;
let riderId;
let driverToken;
let driverId;

async function registerAndLogin(name, email, role) {
  await request(app).post('/api/auth/register').send({
    name, email, password: 'password123', role,
  });
  const login = await request(app).post('/api/auth/login').send({
    email, password: 'password123',
  });
  return {
    token: login.body.token,
    id: (await User.findOne({ email }))._id,
  };
}

async function createRide() {
  const response = await request(app)
    .post('/api/rides')
    .set('Authorization', `Bearer ${riderToken}`)
    .send({
      pickup: 'Pickup point',
      dropoff: 'Destination',
      pickupCoordinates: [32.8872, 13.1913],
      dropoffCoordinates: [32.8950, 13.1800],
    });
  expect(response.statusCode).toBe(201);
  return response.body;
}

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/uberclone_test');
  await User.deleteMany({ email: { $in: ['rider@example.com', 'driver@example.com'] } });
  const rider = await registerAndLogin('Test Rider', 'rider@example.com', 'rider');
  const driver = await registerAndLogin('Test Driver', 'driver@example.com', 'driver');
  riderToken = rider.token;
  riderId = rider.id;
  driverToken = driver.token;
  driverId = driver.id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  await Ride.deleteMany({});
});

describe('Ride API and fare negotiation', () => {
  it('creates a ride with calculated fare details', async () => {
    const ride = await createRide();
    expect(ride.pickup).toBe('Pickup point');
    expect(ride.dropoff).toBe('Destination');
    expect(ride.rider).toBe(String(riderId));
    expect(ride.estimatedFare).toBe(20);
    expect(ride.minimumFare).toBe(17);
    expect(ride.distanceKm).toBe(10);
  });

  it('does not create a ride without authentication', async () => {
    const response = await request(app).post('/api/rides').send({
      pickup: 'Pickup point',
      dropoff: 'Destination',
    });
    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe('No token');
  });

  it('prevents offers below the minimum fare', async () => {
    const ride = await createRide();
    const response = await request(app)
      .post(`/api/rides/${ride._id}/offers`)
      .set('Authorization', `Bearer ${riderToken}`)
      .send({ amount: 16.99 });
    expect(response.statusCode).toBe(400);
    expect(response.body.minimumFare).toBe(17);
  });

  it('allows the driver to accept the rider offer and assigns that driver', async () => {
    const ride = await createRide();
    const offer = await request(app)
      .post(`/api/rides/${ride._id}/offers`)
      .set('Authorization', `Bearer ${riderToken}`)
      .send({ amount: 18 });
    expect(offer.statusCode).toBe(201);

    const accepted = await request(app)
      .post(`/api/rides/${ride._id}/offers/accept`)
      .set('Authorization', `Bearer ${driverToken}`);

    expect(accepted.statusCode).toBe(200);
    expect(String(accepted.body.driver)).toBe(String(driverId));
    expect(accepted.body.agreedFare).toBe(18);
    expect(accepted.body.status).toBe('accepted');
  });

  it('allows the rider to accept the assigned driver counter-offer', async () => {
    const ride = await createRide();
    await request(app)
      .post(`/api/rides/${ride._id}/offers`)
      .set('Authorization', `Bearer ${riderToken}`)
      .send({ amount: 18 });

    const counter = await request(app)
      .post(`/api/rides/${ride._id}/counter-offer`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ amount: 19 });
    expect(counter.statusCode).toBe(201);

    const accepted = await request(app)
      .post(`/api/rides/${ride._id}/offers/accept`)
      .set('Authorization', `Bearer ${riderToken}`);

    expect(accepted.statusCode).toBe(200);
    expect(String(accepted.body.driver)).toBe(String(driverId));
    expect(accepted.body.agreedFare).toBe(19);
    expect(accepted.body.status).toBe('accepted');
  });

  it('does not allow public registration as admin', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Unexpected Admin',
      email: 'unexpected-admin@example.com',
      password: 'password123',
      role: 'admin',
    });
    expect(response.statusCode).toBe(400);
  });

  it('lists rides for the logged-in rider', async () => {
    await createRide();
    const response = await request(app)
      .get('/api/rides')
      .set('Authorization', `Bearer ${riderToken}`);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].pickup).toBe('Pickup point');
  });
});
