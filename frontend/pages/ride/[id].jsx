// frontend/pages/ride/[id].jsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import MapComponent from '../../components/MapComponent';
import RatingStars from '../../components/RatingStars';

const API_URL = 'http://localhost:5000';

export default function RideDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { token } = useAuth();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);

  const [socket, setSocket] = useState(null);
  const [offer, setOffer] = useState('');
  const [message, setMessage] = useState('');

  // جلب تفاصيل الرحلة
  useEffect(() => {
    if (!id) return;

    async function fetchRide() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/rides/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setRide(res.ok ? data : null);
      } catch {
        setRide(null);
      } finally {
        setLoading(false);
      }
    }
    fetchRide();
  }, [id, token]);

  // الاتصال بالسوكيت (التفاوض)
  useEffect(() => {
    if (!id) return;

    const s = io(API_URL);
    setSocket(s);
    s.emit('joinRide', id);

    s.on('offerRejected', ({ minPrice }) => {
      setMessage(`العرض أقل من الحد الأدنى. أقل سعر مسموح: ${minPrice} د.ل`);
    });
    s.on('offerReceived', ({ offer }) => {
      setMessage(`تم إرسال العرض: ${offer} د.ل`);
    });
    s.on('offerError', ({ message }) => {
      setMessage(message);
    });

    return () => s.disconnect();
  }, [id]);

  function handleSendOffer(e) {
    e.preventDefault();
    const value = Number(offer);
    if (!value || value <= 0) {
      setMessage('اكتب سعر صحيح');
      return;
    }
    setMessage('');
    socket.emit('sendOffer', { rideId: id, offer: value });
  }

  if (loading) return <div>Loading...</div>;
  if (!ride) return <div>Ride not found.</div>;

  return (
    <div style={{ maxWidth: 600, margin: '30px auto', padding: 16 }}>
      <h2>Ride Details</h2>
      <div>
        <strong>Pickup:</strong> {ride.pickup}<br />
        <strong>Dropoff:</strong> {ride.dropoff}<br />
        <strong>Status:</strong> {ride.status}<br />
        <strong>Date:</strong>{' '}
        {ride.createdAt ? new Date(ride.createdAt).toLocaleString() : 'N/A'}<br />
        <strong>Distance:</strong>{' '}
        {ride.distance ? (ride.distance / 1000).toFixed(1) + ' km' : 'N/A'}<br />
        <strong>Price:</strong> {ride.price ?   });

    return (): 'N/A'}<br />
        <strong>Driver:</strong> {ride.driver ? ride.driver.name : 'Not assigned'}<br />
        <strong>Driver Rating:</strong> <RatingStars value={ride.rating || 0} /><br />
      </div>

      {ride.status === 'requested' && (
        <form onSubmit={handleSendOffer} style={{ marginTop: 20 }}>
          <h3>تفاوض على السعر</h3>
          <input
            type="number"
            placeholder="سعرك بالدينار"
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
          />
          <button type="submit">إرسال العرض</button>
          {message && <p>{message}</p>}
        </form>
      )}

      {ride.startCoords && ride.endCoords && (
        <MapComponent pickup={ride.startCoords} dropoff={ride.endCoords} />
      )}
    </div>
  );
}
