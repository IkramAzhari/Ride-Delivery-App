# Ride fare and negotiation configuration

The backend calculates a driving route from coordinates supplied with a ride request. Coordinates must be arrays in **[latitude, longitude]** order.

## Fare formula and defaults

For development, the fallback values are:

```env
BASE_FARE_LYD=5
PRICE_PER_KM_LYD=2
MIN_FARE_PERCENT=85
```

These are examples only, not approved local-market prices. The estimated fare is:

`base fare + (route distance in km × price per km)`

The minimum fare is the greater of the base fare and the configured percentage of the estimated fare. Once an administrator saves settings in the dashboard, those database settings take precedence over environment defaults and apply to new rides.

## Administrator access

Only accounts with the `admin` role can read or update `/api/admin/fare-settings`. Public registration accepts only `rider` and `driver`, never `admin`.

To promote a trusted existing account, first identify its email and update that one account in MongoDB using an administrator-controlled database session:

```javascript
db.users.updateOne(
  { email: "trusted-admin@example.com" },
  { $set: { role: "admin" } }
)
```

The account must log out and log in again so its JWT contains the new role. Never expose administrator credentials or enable public admin registration.

## Negotiation flow

- Rider creates a request with pickup/dropoff text and coordinates.
- Backend calculates route distance, estimated fare, and minimum fare.
- Rider may offer an amount between the minimum and estimated fare.
- The assigned driver can accept the rider's latest offer or counter-offer.
- The rider can accept the assigned driver's latest counter-offer or make another offer.
- Once accepted, `agreedFare` is stored and the ride changes to `accepted`.
- A driver may accept the initial request at the estimated fare only when no offers exist.

## API

All endpoints require the existing Bearer JWT authentication.

- `POST /api/rides` — create a ride. Body: `pickup`, `dropoff`, `pickupCoordinates`, `dropoffCoordinates`.
- `POST /api/rides/:id/offers` — rider offer. Body: `amount`.
- `POST /api/rides/:id/counter-offer` — driver counter-offer. Body: `amount`.
- `POST /api/rides/:id/offers/accept` — accept the latest offer from the other party.
- `GET /api/admin/fare-settings` and `PUT /api/admin/fare-settings` — admin-only fare configuration.
- Existing pending, driver, history, accept, complete, and cancel endpoints remain.

Driver counter-offers are capped at 150% of the estimated fare. Backend validation is authoritative; the frontend is not trusted for minimum-price enforcement.

The route calculator currently uses the public OSRM demo routing service. It is suitable for development experiments only; production should use a contracted routing provider with usage limits, availability guarantees, and an appropriate privacy policy. The frontend currently geocodes typed addresses through the public Nominatim service; production use should follow that provider's usage policy or use a suitable geocoding provider.
