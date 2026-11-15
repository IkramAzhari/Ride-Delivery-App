import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// icon override (keep this)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapComponent({ pickup, dropoff }) {
  return (
    <MapContainer
      center={[17.385, 78.4867]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}  // key: fill container
      scrollWheelZoom={true}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {pickup && <Marker position={pickup} />}
      {dropoff && <Marker position={dropoff} />}
    </MapContainer>
  );
}
