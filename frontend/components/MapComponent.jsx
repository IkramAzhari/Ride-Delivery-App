
import { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapUpdater({ pickup }) {
  const map = useMap();

  useEffect(() => {
    if (pickup && Array.isArray(pickup) && pickup.length === 2) {
      map.setView(pickup, 15);
    }
  }, [pickup, map]);

  return null;
}

export default function MapComponent({ pickup, dropoff }) {
  const defaultPosition = [17.385, 78.4867];

  return (
    <MapContainer
      center={defaultPosition}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
        subdomains={['a', 'b', 'c']}
      />

      <MapUpdater pickup={pickup} />

      {pickup && <Marker position={pickup} />}

      {dropoff && <Marker position={dropoff} />}
    </MapContainer>
  );
}
