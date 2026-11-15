import { useState } from 'react';

export default function RideForm({ onRequestRide }) {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onRequestRide({ pickup, dropoff });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Pickup location"
        value={pickup}
        onChange={e => setPickup(e.target.value)}
      />
      <input
        placeholder="Drop-off location"
        value={dropoff}
        onChange={e => setDropoff(e.target.value)}
      />
      <button type="submit">Request Ride</button>
    </form>
  );
}
