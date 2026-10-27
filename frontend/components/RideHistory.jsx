import { useEffect, useState } from 'react';

export default function RideHistory({ token }) {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const cancelRide = async (rideId) => {
    try {
  const res = await fetch(`http://localhost:5000/api/rides/${rideId}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();

if (!res.ok) {
  alert(data.error || 'Failed to cancel ride');
  return;
}

setRides((currentRides) =>
  currentRides.map((ride) =>
    ride._id === rideId ? data : ride
  )
);
}catch (err) {
  console.error('Cancel ride error:', err);
  alert('Could not cancel ride. Please try again.');
}
  };

  useEffect(() => {
    if (!token) return;

    const fetchRides = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/rides', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setRides(data);
        } else {
          console.error('Ride history error:', data);
        }
      } catch (err) {
        console.error('Ride history fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, [token]);

  
  
  if (loading) return <p>Loading rides...</p>;

  return (
    <div>
      <h2>My Rides</h2>
      {rides.length === 0 && <p>No rides yet.</p>}
      {rides.map((ride) => (
        <div key={ride._id} style={{ border: '1px solid #ddd', margin: 8, padding: 8 }}>
          <p><b>Pickup:</b> {ride.pickup}</p>
          <p><b>Dropoff:</b> {ride.dropoff}</p>
          <p><b>Status:</b> {ride.status}</p>
            
{ride.status === 'completed' && (
  <button
    onClick={async () => {
      const description = window.prompt(
        'Describe the lost item:'
      );

      if (!description || !description.trim()) return;

      try {
        const response = await fetch(
          'http://localhost:5000/api/lost-items',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              rideId: ride._id,
              description: description.trim(),
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || 'Failed to report lost item');
          return;
        }

        alert('Lost item reported successfully!');
      } catch (error) {
        alert('Could not connect to the server');
      }
    }}
  >
    Report Lost Item
  </button>
)}

          {ride.status === 'requested' && (
            <button onClick={() => cancelRide(ride._id)}>
              Cancel Ride
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
