# Ride fare and negotiation configuration

The backend calculates a driving route from coordinates supplied with a ride request. Coordinates must be arrays in **[latitude, longitude]** order.

## Environment settings

Add these optional variables to the backend environment:

```env
BASE_FARE_LYD=5
PRICE_PER_KM_LYD=2
MIN_FARE_PERCENT=85
```

These are development defaults/examples, not validated local market prices. Change them before real use. The minimum fare is the greater of the base fare and the configured percentage of the calculated fare.

The route calculator currently uses the public OSRM demo routing service. It is suitable for development experiments only; production should use a contracted routing provider with usage limits, availability guarantees, and an appropriate privacy policy. The frontend currently geocodes typed addresses through the public Nominatim service; production use should follow that provider's usage policy or use a suitable geocoding provider.

## Negotiation flow

- Rider creates a request with pickup/dropoff text and coordinates.
- Backend calculates route distance, estimated fare, and minimum fare.
- Rider may offer an amount between the minimum and estimated fare.
- The driver can accept the rider's latest offer or counter-offer.
- The rider can accept the driver's latest counter-offer or make another offer.
- Once accepted, `agreedFare` is stored and the ride changes to `accepted`.
- A driver may accept the initial request at the estimated fare only when no offers exist.

## API

All endpoints require the existing Bearer JWT authentication.

- `POST /api/rides` — create a ride. Body: `pickup`, `dropoff`, `pickupCoordinates`, `dropoffCoordinates`.
- `POST /api/rides/:id/offers` — rider offer. Body: `amount`.
- `POST /api/rides/:id/counter-offer` — driver counter-offer. Body: `amount`.
- `POST /api/rides/:id/offers/accept` — accept the latest offer from the other party.
- Existing pending, driver, history, accept, complete, and cancel endpoints remain.

Driver counter-offers are currently capped at 150% of the estimated fare. All fare validation is performed by the backend; the frontend is not trusted for minimum-price enforcement.
