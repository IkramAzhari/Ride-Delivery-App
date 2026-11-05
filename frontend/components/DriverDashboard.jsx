import React, { useEffect, useState } from 'react';

export default function DriverDashboard({ token }) {
  const [rides, setRides] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replies, setReplies] = useState({});
  const [statuses, setStatuses] = useState({});

  const fetchPendingRides = async () => {
    if (!token) return;

    try {
      const [pendingRes, driverRes] = await Promise.all([
        fetch('http://localhost:5000/api/rides/pending', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://localhost:5000/api/rides/driver', {
          headers: { Authorization: `Bearer ${token}` },
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

  const fetchDriverLostItems = async () => {
    if (!token) return;

    try {
      const res = await fetch(
        'http://localhost:5000/api/lost-items/driver',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setLostItems(data);
      } else {
        console.error('Error fetching lost items:', data);
      }
    } catch (err) {
      console.error('Error fetching lost items:', err);
    }
  };

  const handleAccept = async (rideId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/rides/${rideId}/accept`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        fetchPendingRides();
      } else {
        alert(data.error || 'Failed to accept ride');
      }
    } catch (err) {
      alert('Server error while accepting ride');
    }
  };

  const handleComplete = async (rideId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/rides/${rideId}/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        fetchPendingRides();
        fetchDriverLostItems();
      } else {
        alert(data.error || 'Failed to complete ride');
      }
    } catch (err) {
      alert('Server error while completing ride');
    }
  };

  const handleReply = async (itemId) => {
    const reply = replies[itemId]?.trim();
    const status = statuses[itemId] || 'not_found';

    if (!reply) {
      alert('Please write a reply first');
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/lost-items/${itemId}/reply`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reply, status }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert('Reply sent successfully');
        setReplies((prev) => ({ ...prev, [itemId]: '' }));
        fetchDriverLostItems();
      } else {
        alert(data.message || 'Failed to send reply');
      }
    } catch (err) {
      alert('Server error while sending reply');
    }
  };

  useEffect(() => {
    fetchPendingRides();
    fetchDriverLostItems();

    const interval = setInterval(() => {
      fetchPendingRides();
      fetchDriverLostItems();
    }, 5000);

    return () => clearInterval(interval);
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
            style={{
              border: '1px solid #ddd',
              margin: 8,
              padding: 8,
              borderRadius: 6,
            }}
          >
            <strong>Pickup:</strong> {ride.pickup}
            <br />
            <strong>Dropoff:</strong> {ride.dropoff}
            <br />
            <strong>Status:</strong> {ride.status}
            <br />

            {ride.status === 'requested' && (
              <button onClick={() => handleAccept(ride._id)}>
                Accept Ride
              </button>
            )}

            {ride.status === 'accepted' && (
              <button onClick={() => handleComplete(ride._id)}>
                Mark Completed
              </button>
            )}
          </li>
        ))}
      </ul>

      <hr />

      <h2>Lost Item Reports</h2>

      {lostItems.length === 0 && (
        <p>No lost item reports for your completed rides.</p>
      )}

      {lostItems.map((item) => (
        <div
          key={item._id}
          style={{
            border: '1px solid #ddd',
            margin: 8,
            padding: 12,
            borderRadius: 6,
          }}
        >
          <p>
            <strong>Lost Item:</strong> {item.description}
          </p>

          <p>
            <strong>Ride:</strong>{' '}
            {item.ride?.pickup} → {item.ride?.dropoff}
          </p>

          <p>
            <strong>Rider:</strong> {item.rider?.name || 'Unknown'}
          </p>

          <p>
            <strong>Status:</strong> {item.status}
          </p>

          {item.driverReply ? (
            <p>
              <strong>Your Reply:</strong> {item.driverReply}
            </p>
          ) : (
            <>
              <textarea
                placeholder="Write your reply..."
                value={replies[item._id] || ''}
                onChange={(e) =>
                  setReplies((prev) => ({
                    ...prev,
                    [item._id]: e.target.value,
                  }))
                }
                style={{
                  width: '100%',
                  minHeight: 80,
                  marginBottom: 8,
                }}
              />

              <select
                value={statuses[item._id] || 'not_found'}
                onChange={(e) =>
                  setStatuses((prev) => ({
                    ...prev,
                    [item._id]: e.target.value,
                  }))
                }
                style={{ marginRight: 8 }}
              >
                <option value="found">Found</option>
                <option value="not_found">Not Found</option>
              </select>

              <button onClick={() => handleReply(item._id)}>
                Send Reply
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}