import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function RideHistory({ token }) {
  const { t } = useLanguage();

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
      alert(t('serverError'));
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
    const description = window.prompt(
      t('describeLostItem')
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
            rideId,
            description: description.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || t('reportFailed'));
        return;
      }

      setLostItems((current) => [...current, data.lostItem]);

      alert(t('reportedSuccessfully'));
    } catch (error) {
      alert(t('serverError'));
    }
  };

  useEffect(() => {
    if (!token) return;

    const fetchRides = async () => {
      try {
        const res = await fetch(
          'http://localhost:5000/api/rides',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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

  if (loading) return <p>{t('loadingRides')}</p>;

  return (
    <div dir="auto">
      <h2>{t('myRides')}</h2>

      {rides.length === 0 && <p>{t('noRides')}</p>}

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
            <p>
              <b>{t('pickup')}:</b> {ride.pickup}
            </p>

            <p>
              <b>{t('dropoff')}:</b> {ride.dropoff}
            </p>

            <p>
              <b>{t('status')}:</b>{' '}
              {ride.status === 'completed'
                ? t('completed')
                : ride.status === 'requested'
                ? t('requested')
                : ride.status === 'accepted'
                ? t('accepted')
                : ride.status === 'cancelled'
                ? t('cancelled')
                : ride.status}
            </p>

            {ride.status === 'completed' && !lostItem && (
              <button onClick={() => reportLostItem(ride._id)}>
                {t('reportLostItem')}
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
                <h4>{t('lostItemReports')}</h4>

                <p>
                  <b>{t('description')}:</b> {lostItem.description}
                </p>

                <p>
                  <b>{t('status')}:</b>{' '}
                  {lostItem.status === 'found'
                    ? t('found')
                    : lostItem.status === 'not_found'
                    ? t('notFound')
                    : lostItem.status === 'resolved'
                    ? t('resolved')
                    : lostItem.status === 'under_review'
                    ? t('underReview')
                    : t('reported')}
                </p>

                {lostItem.driverReply ? (
                  <div>
                    <p><b>{t('driverReply')}:</b></p>
                    <p>{lostItem.driverReply}</p>
                  </div>
                ) : (
                  <p>{t('waitingReply')}</p>
                )}
              </div>
            )}

            {ride.status === 'requested' && (
              <button onClick={() => cancelRide(ride._id)}>
                {t('cancelRide')}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}