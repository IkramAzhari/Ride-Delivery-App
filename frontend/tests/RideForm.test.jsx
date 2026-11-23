
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import RideForm from '../components/RideForm';
import { LanguageProvider } from '../context/LanguageContext';

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
      <LanguageProvider>
        <RideForm onRequestRide={mockRequestRide} />
      </LanguageProvider>
    );

    fireEvent.change(
      getByPlaceholderText(/Enter pickup location or use GPS/i),
      {
        target: { value: 'Hitech City' },
      }
    );

    fireEvent.change(
      getByPlaceholderText(/Where do you want to go/i),
      {
        target: { value: 'Miyapur' },
      }
    );

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
