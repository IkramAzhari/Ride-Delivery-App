import React from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// إصلاح أيقونة الدبوس
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// مكون لتحديث مركز الخريطة تلقائياً عند تغير موقع الانطلاق
function ChangeView({ center }) {
  const map = useMap();
  if (center) {
    map.setView(center, 14);
  }
  return null;
}

export default function MapComponent({ pickup, dropoff }) {
  // الإحداثيات الافتراضية إذا لم يتم تحديد موقع بعد
  const defaultCenter = [32.7569, 12.5714]; 
  const currentCenter = Array.isArray(pickup) ? pickup : defaultCenter;

  return (
    <MapContainer center={currentCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
      <ChangeView center={currentCenter} />
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {Array.isArray(pickup) && <Marker position={pickup} />}
    </MapContainer>
  );
}