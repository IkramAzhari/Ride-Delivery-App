import React, { useEffect, useState } from 'react';

export default function DriverDashboard({ token }) {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

 const fetchPendingRides = async () => {
  if (!token) return;

  try {
    const [pendingRes, driverRes] = await Promise.all([
      fetch('http://localhost:5000/api/rides/pending', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      fetch('http://localhost:5000/api/rides/driver', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ]);

    const pendingData = await pendingRes.json();
    const driverData = await driverRes.json();

    if (pendingRes.ok && driverRes.ok) {
      setRides([...pendingData, ...driverData]);
    } else {
      console.error('Error fetching rides:', pendingData, driverData);
    }
  } catch (err) {
    console.error('Error fetching rides:', err);
  } finally {
    setLoading(false);
  }
};

  const handleAccept = async (rideId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/rides/${rideId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        // refresh list
        fetchPendingRides();
      } else {
        console.error('Accept ride error:', data);
        alert(data.error || 'Failed to accept ride');
      }
    } catch (err) {
      console.error('Accept ride error:', err);
      alert('Server error while accepting ride');
    }
  };

  const handleComplete = async (rideId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/rides/${rideId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        // refresh list
        fetchPendingRides();
      } else {
        console.error('Complete ride error:', data);
        alert(data.error || 'Failed to complete ride');
      }
    } catch (err) {
      console.error('Complete ride error:', err);
      alert('Server error while completing ride');
    }
  };

  useEffect(() => {
    fetchPendingRides(); // on load
    const interval = setInterval(fetchPendingRides, 5000); // poll every 5s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (loading) return <p>Loading ride requests...</p>;

  return (
    <div>
      <h2>Driver Dashboard</h2>
      {rides.length === 0 && <p>No rides available.</p>}
      <ul>
        {rides.map((ride) => (
          <li
            key={ride._id}
            style={{ border: '1px solid #ddd', margin: 8, padding: 8, borderRadius: 6 }}
          >
            <strong>Pickup:</strong> {ride.pickup}
            <br />
            <strong>Dropoff:</strong> {ride.dropoff}
            <br />
            <strong>Status:</strong> {ride.status}
            <br />
            {ride.status === 'requested' && (
              <button onClick={() => handleAccept(ride._id)}>Accept Ride</button>
            )}
            {ride.status === 'accepted' && (
              <button onClick={() => handleComplete(ride._id)}>Mark Completed</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
