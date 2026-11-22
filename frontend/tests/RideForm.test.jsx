import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import RideForm from '../components/RideForm';

describe('RideForm', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ lat: '32.8872', lon: '13.1913' }],
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('geocodes both locations and submits their coordinates', async () => {
    const mockRequestRide = jest.fn();
    const { getByPlaceholderText, getByRole } = render(
      <RideForm onRequestRide={mockRequestRide} />
    );

    fireEvent.change(getByPlaceholderText(/Pickup location/i), {
      target: { value: 'Hitech City' },
    });
    fireEvent.change(getByPlaceholderText(/Drop-off location/i), {
      target: { value: 'Miyapur' },
    });
    fireEvent.click(getByRole('button', { name: 'Request Ride' }));

    await waitFor(() => {
      expect(mockRequestRide).toHaveBeenCalledWith({
        pickup: 'Hitech City',
        dropoff: 'Miyapur',
        pickupCoordinates: [32.8872, 13.1913],
        dropoffCoordinates: [32.8872, 13.1913],
      });
    });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
