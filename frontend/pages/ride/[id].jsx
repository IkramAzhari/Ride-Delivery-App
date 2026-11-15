import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MapComponent from '../../components/MapComponent';
import RatingStars from '../../components/RatingStars';

export default function RideDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchRide() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/rides/${id}`);
        const data = await res.json();
        setRide(data);
      } catch {
        setRide(null);
      } finally {
        setLoading(false);
      }
    }
    fetchRide();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!ride) return <div>Ride not found.</div>;

  return (
    <div style={{ maxWidth: 600, margin: "30px auto", padding: 16 }}>
      <h2>Ride Details</h2>
      <div>
        <strong>Pickup:</strong> {ride.pickup}<br />
        <strong>Dropoff:</strong> {ride.dropoff}<br />
        <strong>Status:</strong> {ride.status}<br />
        <strong>Date:</strong> {ride.date ? new Date(ride.date).toLocaleString() : 'N/A'}<br />
        <strong>Fare:</strong> ₹{ride.fare || 'N/A'}<br />
        <strong>Driver:</strong> {ride.driver ? ride.driver.name : 'Not assigned'}<br />
        <strong>Driver Rating:</strong> <RatingStars value={ride.rating || 0} /><br />
      </div>
      {/* Show ride route on map if coords available */}
      {ride.startCoords && ride.endCoords && (
        <MapComponent pickup={ride.startCoords} dropoff={ride.endCoords} />
      )}
    </div>
  );
}
