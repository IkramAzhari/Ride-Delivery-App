
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function RideForm({
  onRequestRide,
  onPickupLocationSelected,
}) {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  const { language } = useLanguage();
  const isArabic = language === 'ar';

  async function handleGetCurrentLocation() {
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError(
        isArabic
          ? 'المتصفح لا يدعم تحديد الموقع.'
          : 'Your browser does not support location services.'
      );
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;

        try {
          const url = new URL(
            'https://nominatim.openstreetmap.org/reverse'
          );

          url.search = new URLSearchParams({
            format: 'jsonv2',
            lat: String(latitude),
            lon: String(longitude),
            'accept-language': language,
          }).toString();

          const response = await fetch(url.toString());

          if (!response.ok) {
            throw new Error('Address lookup failed');
          }

          const data = await response.json();
          const address = data.display_name?.trim();

          if (!address) {
            throw new Error('No address found');
          }

          setPickup(address);
          onPickupLocationSelected?.([latitude, longitude]);
        } catch (error) {
          setLocationError(
            isArabic
              ? 'تعذر تحديد عنوان موقعك. حاول مرة أخرى.'
              : 'Could not find your address. Please try again.'
          );
        } finally {
          setLoadingLocation(false);
        }
      },

      (error) => {
        setLocationError(
          error.code === 1
            ? (isArabic
                ? 'يرجى السماح للمتصفح بالوصول إلى موقعك.'
                : 'Please allow your browser to access your location.')
            : (isArabic
                ? 'تعذر الوصول إلى موقعك. تحقق من إعدادات الموقع.'
                : 'Unable to get your location. Check your location settings.')
        );

        setLoadingLocation(false);
      },

      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!pickup.trim() || !dropoff.trim()) return;

    // If the user entered the pickup location manually,
    // try to find its coordinates for the map.
    try {
      const url = new URL(
        'https://nominatim.openstreetmap.org/search'
      );

      url.search = new URLSearchParams({
        format: 'jsonv2',
        q: pickup.trim(),
        limit: '1',
        'accept-language': language,
      }).toString();

      const response = await fetch(url.toString());

      if (response.ok) {
        const results = await response.json();

        if (results.length > 0) {
          onPickupLocationSelected?.([
            Number(results[0].lat),
            Number(results[0].lon),
          ]);
        }
      }
    } catch (error) {
      console.error('Manual location lookup failed:', error);
    }

    // Only the address text is sent with the ride request.
    onRequestRide({
      pickup: pickup.trim(),
      dropoff: dropoff.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="pickup-location">
        {isArabic ? 'موقع الانطلاق' : 'Pickup location'}
      </label>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input
          id="pickup-location"
          type="text"
          placeholder={
            isArabic
              ? 'اكتب موقع الانطلاق أو حدده عبر GPS'
              : 'Enter pickup location or use GPS'
          }
          value={pickup}
          onChange={(e) => {
            setPickup(e.target.value);
            setLocationError('');
            onPickupLocationSelected?.(null);
          }}
          required
          style={{ flex: 1 }}
        />

        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={loadingLocation}
        >
          {loadingLocation
            ? (isArabic ? 'جارٍ التحديد...' : 'Locating...')
            : (isArabic ? '📍 موقعي' : '📍 My Location')}
        </button>
      </div>

      {locationError && (
        <p role="alert" style={{ color: '#c0392b' }}>
          {locationError}
        </p>
      )}

      <label htmlFor="dropoff-location">
        {isArabic ? 'الوجهة' : 'Drop-off location'}
      </label>

      <input
        id="dropoff-location"
        type="text"
        placeholder={
          isArabic
            ? 'إلى أين تريد الذهاب؟'
            : 'Where do you want to go?'
        }
        value={dropoff}
        onChange={(e) => setDropoff(e.target.value)}
        required
      />

      <button type="submit">
        {isArabic ? 'طلب رحلة' : 'Request Ride'}
      </button>
    </form>
  );
}
