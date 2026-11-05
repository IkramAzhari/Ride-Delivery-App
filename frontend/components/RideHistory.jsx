import { useEffect, useState } from 'react';

export default function RideHistory({ token }) {
  const [rides, setRides] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const cancelRide = async (rideId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/rides/${rideId}/cancel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
    } catch (err) {
      console.error('Cancel ride error:', err);
      alert('Could not cancel ride. Please try again.');
    }
  };

  const fetchLostItems = async () => {
    try {
      const res = await fetch(
        'http://localhost:5000/api/lost-items/my',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setLostItems(data);
      } else {
        console.error('Lost items error:', data);
      }
    } catch (err) {
      console.error('Lost items fetch error:', err);
    }
  };

  const reportLostItem = async (rideId) => {
    const description = window.prompt('Describe the lost item:');

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
            rideId,
            description: description.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to report lost item');
        return;
      }

      setLostItems((current) => [...current, data.lostItem]);

      alert('Lost item reported successfully!');
    } catch (error) {
      alert('Could not connect to the server');
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
    fetchLostItems();
  }, [token]);

  if (loading) return <p>Loading rides...</p>;

  return (
    <div>
      <h2>My Rides</h2>

      {rides.length === 0 && <p>No rides yet.</p>}

      {rides.map((ride) => {
        const lostItem = lostItems.find((item) => {
          const reportedRideId =
            typeof item.ride === 'object'
              ? item.ride?._id
              : item.ride;

          return String(reportedRideId) === String(ride._id);
        });

        return (
          <div
            key={ride._id}
            style={{
              border: '1px solid #ddd',
              margin: 8,
              padding: 8,
              borderRadius: 6,
            }}
          >
            <p><b>Pickup:</b> {ride.pickup}</p>
            <p><b>Dropoff:</b> {ride.dropoff}</p>
            <p><b>Status:</b> {ride.status}</p>

            {ride.status === 'completed' && !lostItem && (
              <button onClick={() => reportLostItem(ride._id)}>
                Report Lost Item
              </button>
            )}

            {lostItem && (
              <div
                style={{
                  marginTop: 12,
                  padding: 10,
                  background: '#f5f5f5',
                  borderRadius: 6,
                }}
              >
                <h4>Lost Item Report</h4>

                <p>
                  <b>Description:</b> {lostItem.description}
                </p>

                <p>
                  <b>Status:</b>{' '}
                  {lostItem.status === 'found'
                    ? 'Found'
                    : lostItem.status === 'not_found'
                    ? 'Not Found'
                    : lostItem.status === 'resolved'
                    ? 'Resolved'
                    : lostItem.status === 'under_review'
                    ? 'Under Review'
                    : 'Reported'}
                </p>

                {lostItem.driverReply ? (
                  <div>
                    <p><b>Driver Reply:</b></p>
                    <p>{lostItem.driverReply}</p>
                  </div>
                ) : (
                  <p>Waiting for driver response...</p>
                )}
              </div>
            )}

            {ride.status === 'requested' && (
              <button onClick={() => cancelRide(ride._id)}>
                Cancel Ride
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}