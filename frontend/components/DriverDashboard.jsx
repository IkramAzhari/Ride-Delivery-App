import React, { useState, useEffect } from 'react';

export default function DriverDashboard() {
  const [rideRequest, setRideRequest] = useState(null);
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    const checkRide = () => {
      const savedRide = localStorage.getItem('currentRideRequest');
      if (savedRide) {
        try {
          const ride = JSON.parse(savedRide);
          // عرض الطلبات المعلقة أو المقبولة فقط في شاشة السائق
          if (ride.status !== 'rejected') {
            setRideRequest(ride);
            setStatus(ride.status || 'pending');
          } else {
            setRideRequest(null);
            setStatus('pending');
          }
        } catch (e) {
          setRideRequest(null);
        }
      } else {
        setRideRequest(null);
        setStatus('pending');
      }
    };

    checkRide();
    const interval = setInterval(checkRide, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = () => {
    setStatus('accepted');
    if (rideRequest) {
      const updated = { ...rideRequest, status: 'accepted' };
      localStorage.setItem('currentRideRequest', JSON.stringify(updated));
    }
  };

  const handleReject = () => {
    setStatus('rejected');
    if (rideRequest) {
      // تحديث الحالة إلى مرفوض ليصل الإشعار للراكب قبل الإغلاق
      const updated = { ...rideRequest, status: 'rejected' };
      localStorage.setItem('currentRideRequest', JSON.stringify(updated));
    }
    setRideRequest(null);
  };

  return (
    <div style={{
      background: '#ffffff',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      direction: 'rtl',
      textAlign: 'right',
      marginTop: '20px',
      border: '1px solid #e0e0e0'
    }}>
      <h2 style={{
        color: '#092032',
        marginBottom: '20px',
        borderBottom: '2px solid #0070f3',
        paddingBottom: '10px',
        fontSize: '20px',
        fontWeight: 'bold'
      }}>
        🚕 الطلبات الواردة من الركاب
      </h2>

      {!rideRequest ? (
        <p style={{ color: '#444', fontSize: '16px', padding: '20px 0', fontWeight: '500' }}>
          لا توجد طلبات رحلات حالياً. في انتظار طلب جديد من راكب...
        </p>
      ) : (
        <div style={{
          border: '2px solid #0070f3',
          borderRadius: '10px',
          padding: '20px',
          backgroundColor: '#f0f4f8'
        }}>
          <div style={{ marginBottom: '12px', fontSize: '17px', color: '#111', fontWeight: 'bold' }}>
            <strong>👤 اسم الراكب:</strong>{' '}
            <span style={{ color: '#0070f3' }}>{rideRequest.passengerName}</span>
          </div>

          <div style={{ marginBottom: '12px', fontSize: '17px', color: '#111', fontWeight: 'bold' }}>
            <strong>📍 موقع الانطلاق:</strong>{' '}
            <span style={{ color: '#333' }}>{rideRequest.pickup}</span>
          </div>

          <div style={{ marginBottom: '20px', fontSize: '17px', color: '#111', fontWeight: 'bold' }}>
            <strong>🏁 الوجهة المطلوبة:</strong>{' '}
            <span style={{ color: '#333' }}>{rideRequest.dropoff}</span>
          </div>

          {status === 'accepted' ? (
            <div style={{
              background: '#d4edda',
              color: '#155724',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 'bold',
              textAlign: 'center',
              fontSize: '16px'
            }}>
              ✅ تم قبول الرحلة! تم إرسال تأكيد للراكب ({rideRequest.passengerName}).
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleAccept}
                style={{
                  flex: 1,
                  background: '#28a745',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                قبول الطلب
              </button>
              <button
                onClick={handleReject}
                style={{
                  flex: 1,
                  background: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                رفض
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}