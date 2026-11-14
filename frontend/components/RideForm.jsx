import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RideForm({ onRequestRide }) {
  const { user } = useAuth();
  
  const [passengerName, setPassengerName] = useState('');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  // حالة إشعار رد السائق (pending, accepted, rejected)
  const [rideStatus, setRideStatus] = useState(null);

  useEffect(() => {
    if (user && user.name) {
      setPassengerName(user.name);
    } else {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.name) setPassengerName(parsed.name);
        } catch (e) {}
      }
    }
  }, [user]);

  // مراقبة رد السائق كل ثانية وتحديث واجهة الراكب فوراً
  useEffect(() => {
    const checkStatus = () => {
      const savedRide = localStorage.getItem('currentRideRequest');
      if (savedRide) {
        try {
          const ride = JSON.parse(savedRide);
          setRideStatus(ride.status);
        } catch (e) {
          setRideStatus(null);
        }
      } else {
        setRideStatus(null);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('المتصفح لا يدعم تحديد الموقع');
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        if (typeof onRequestRide === 'function') {
          onRequestRide({ updateMapOnly: true, coords: [latitude, longitude] });
        }

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ar`
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || '';
          const road = data.address?.road || data.address?.suburb || '';
          const fullAddress = [city, road].filter(Boolean).join(' - ') || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          
          setPickup(fullAddress);
        } catch (error) {
          setPickup(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setLoadingLocation(false);
        }
      },
      () => {
        alert('تعذر الوصول لموقعك، يرجى تفعيل الـ GPS');
        setLoadingLocation(false);
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!passengerName.trim()) {
      alert('يرجى إدخال اسم الراكب أولاً');
      return;
    }

    if (!pickup.trim() || !dropoff.trim()) {
      alert('يرجى تحديد موقع الانطلاق والوجهة');
      return;
    }

    const rideData = {
      passengerName: passengerName.trim(),
      pickup: pickup.trim(),
      dropoff: dropoff.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('currentRideRequest', JSON.stringify(rideData));
    setRideStatus('pending');

    if (typeof onRequestRide === 'function') {
      onRequestRide({ pickup, dropoff });
    }
  };

  // دالة لإغلاق الإشعار والبدء بطلب جديد
  const handleClearStatus = () => {
    localStorage.removeItem('currentRideRequest');
    setRideStatus(null);
  };

  return (
    <div style={{ direction: 'rtl', textAlign: 'right' }}>
      
      {/* صندوق رسائل التأكيد والرد للراكب */}
      {rideStatus === 'pending' && (
        <div style={{
          background: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffeeba',
          padding: '14px',
          borderRadius: '8px',
          marginBottom: '15px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          ⏳ تم إرسال طلبك! في انتظار موافقة السائق...
        </div>
      )}

      {rideStatus === 'accepted' && (
        <div style={{
          background: '#d4edda',
          color: '#155724',
          border: '2px solid #28a745',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '15px',
          fontWeight: 'bold',
          textAlign: 'center',
          fontSize: '16px'
        }}>
          ✅ تم تأكيد رحلتك! السائق وافق على طلبك وهو في الطريق إليك الآن.
          <div style={{ marginTop: '10px' }}>
            <button
              type="button"
              onClick={handleClearStatus}
              style={{
                background: '#155724',
                color: '#fff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              إنهاء / طلب رحلة جديدة
            </button>
          </div>
        </div>
      )}

      {rideStatus === 'rejected' && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          border: '2px solid #dc3545',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '15px',
          fontWeight: 'bold',
          textAlign: 'center',
          fontSize: '16px'
        }}>
          ❌ عذراً، السائق رفض الطلب حالياً. يمكنك المحاولة وطلب سائق آخر.
          <div style={{ marginTop: '10px' }}>
            <button
              type="button"
              onClick={handleClearStatus}
              style={{
                background: '#721c24',
                color: '#fff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              إغلاق والمحاولة مجدداً
            </button>
          </div>
        </div>
      )}

      {/* نموذج حجز الرحلة */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#092032' }}>
            اسم الراكب
          </label>
          <input
            type="text"
            placeholder="اكتب اسمك هنا (مثلاً: محمد، نور...)"
            value={passengerName}
            onChange={(e) => setPassengerName(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '15px',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#092032' }}>
            موقع الانطلاق
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="حدد موقعك أو اضغط زر موقعي"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              required
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontSize: '15px',
              }}
            />
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={loadingLocation}
              style={{
                background: '#0070f3',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0 14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {loadingLocation ? 'جاري التحديد...' : '📍 موقعي'}
            </button>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#092032' }}>
            موقع الوصول (الوجهة)
          </label>
          <input
            type="text"
            placeholder="إلى أين تريد الذهاب؟"
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '15px',
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            marginTop: '8px',
            background: '#092032',
            color: '#fff',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          بحث عن سائق
        </button>
      </form>
    </div>
  );
}