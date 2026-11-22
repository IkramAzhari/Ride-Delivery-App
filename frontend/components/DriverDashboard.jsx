
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function DriverDashboard({ token }) {
  const { t } = useLanguage();

  const [rides, setRides] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replies, setReplies] = useState({});
  const [statuses, setStatuses] = useState({});

  const translateStatus = (status) => {
    const statusKeys = {
      requested: 'requested',
      accepted: 'accepted',
      completed: 'completed',
      cancelled: 'cancelled',
      reported: 'reported',
      under_review: 'underReview',
      found: 'found',
      not_found: 'notFound',
      resolved: 'resolved',
    };

    return statusKeys[status] ? t(statusKeys[status]) : status;
  };

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


  const submitCounterOffer = async (rideId) => {
    const value = window.prompt('أدخل السعر المقترح بالدينار الليبي:');
    if (value === null) return;
    const amount = Number(value);
    if (!Number.isFinite(amount)) return alert('يرجى إدخال مبلغ صحيح');
    try {
      const res = await fetch(`http://localhost:5000/api/rides/${rideId}/counter-offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || 'تعذر إرسال العرض');
      fetchPendingRides();
    } catch (error) { alert(t('serverError')); }
  };

  const acceptLatestOffer = async (rideId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/rides/${rideId}/offers/accept`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || 'تعذر قبول العرض');
      fetchPendingRides();
    } catch (error) { alert(t('serverError')); }
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
      alert(t('serverError'));
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
      alert(t('serverError'));
    }
  };

  const handleReply = async (itemId) => {
    const reply = replies[itemId]?.trim();
    const status = statuses[itemId] || 'not_found';

    if (!reply) {
      alert(t('replyRequired'));
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
        alert(t('replySent'));
        setReplies((prev) => ({ ...prev, [itemId]: '' }));
        fetchDriverLostItems();
      } else {
        alert(data.message || 'Failed to send reply');
      }
    } catch (err) {
      alert(t('serverError'));
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

  if (loading) return <p>{t('loadingRides')}</p>;

  return (
    <div dir="auto">
      <h2>{t('driverDashboard')}</h2>

      {rides.length === 0 && <p>{t('noRidesAvailable')}</p>}

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
            <strong>{t('pickup')}:</strong> {ride.pickup}
            <br />

            <strong>{t('dropoff')}:</strong> {ride.dropoff}
            <br />

            <strong>{t('status')}:</strong> {translateStatus(ride.status)}
            <br />
            {ride.estimatedFare != null && (
              <>
                <strong>المسافة:</strong> {ride.distanceKm} كم<br />
                <strong>السعر المقترح:</strong> {ride.estimatedFare} د.ل<br />
                <strong>أقل سعر مسموح:</strong> {ride.minimumFare} د.ل<br />
              </>
            )}
            {ride.offers?.map((offer) => (
              <p key={offer._id}>{offer.byRole === 'rider' ? 'عرض الراكب' : 'عرض السائق'}: {offer.amount} د.ل</p>
            ))}

           <strong>وقت الحجز:</strong> {new Date(ride.createdAt).toLocaleString('ar-LY')}
            
            {ride.status === 'requested' && (
              <>
                {(!ride.offers || ride.offers.length === 0) && (
                  <button onClick={() => handleAccept(ride._id)}>{t('acceptRide')} ({ride.estimatedFare} د.ل)</button>
                )}
                {ride.offers?.length > 0 && ride.offers[ride.offers.length - 1].byRole === 'rider' && (
                  <>
                    <button onClick={() => acceptLatestOffer(ride._id)}>قبول عرض الراكب</button>
                    <button onClick={() => submitCounterOffer(ride._id)}>تقديم سعر مضاد</button>
                  </>
                )}
              </>
            )}

            {ride.status === 'accepted' && (
              <button onClick={() => handleComplete(ride._id)}>
                {t('markCompleted')}
              </button>
            )}
          </li>
        ))}
      </ul>

      <hr />

      <h2>{t('lostItemReports')}</h2>

      {lostItems.length === 0 && <p>{t('noLostItems')}</p>}

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
            <strong>{t('lostItem')}:</strong> {item.description}
          </p>

          <p>
            <strong>{t('pickup')}:</strong> {item.ride?.pickup}
          </p>

          <p>
            <strong>{t('dropoff')}:</strong> {item.ride?.dropoff}
          </p>

          <p>
            <strong>{t('rider')}:</strong>{' '}
            {item.rider?.name || (t('unknown'))}
          </p>

          <p>
            <strong>{t('status')}:</strong>{' '}
            {translateStatus(item.status)}
          </p>

          {item.driverReply ? (
            <p>
              <strong>{t('yourReply')}:</strong> {item.driverReply}
            </p>
          ) : (
            <>
              <textarea
                placeholder={t('writeReply')}
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
                <option value="found">{t('found')}</option>
                <option value="not_found">{t('notFound')}</option>
              </select>

              <button onClick={() => handleReply(item._id)}>
                {t('sendReply')}
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
