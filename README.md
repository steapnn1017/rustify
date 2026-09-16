# RUSTIFY.GG

EU Rust cluster: Main 2x, Mondays 2x, Monthly 2x. Steam OpenID, per-server store, Czech/EU legal pages.

```bash
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

VIP / Queue Skip / Pro checkout requires Steam login. The purchase is bound to that SteamID64 and granted on the selected server. Payments use `PAYMENT_PROVIDER` (`mock` locally, `stripe` in production). Stripe Checkout + `/api/webhooks/payment` fulfill orders; success page also verifies the session when Stripe is enabled.

Account profile (`/account`) shows your Steam name (also in the header), Discord link, purchase history, entitlements, and per-server stats (Main / Mondays / Monthly). Game plugins can push live stats to `POST /api/game/stats` and poll `GET /api/game/entitlements?steamId={64}&serverId={main|mondays|monthly}` with `Authorization: Bearer GAME_API_SECRET`. Optional Source RCON push is configured per server.

Live player counts come from `src/lib/live` (`LIVE_DATA_PROVIDER=mock` by default). Fill `OPERATOR_*` before taking the store live.
