# Frontend

React trading platform UI for the broker platform — **T1 Brokers**.

## Overview

A full-featured single-page application for retail trading, portfolio management, market monitoring, and algorithmic bot control. Connects to the backend via REST and WebSocket (real-time price ticks and order updates).

## Tech Stack

- **React 19** + **Vite 8** (dev server and build tool)
- **React Router DOM 7** — client-side routing
- **Tailwind CSS 4** — utility-first styling
- **Framer Motion 12** — animations
- **Recharts 3** + **Lightweight Charts 5** — portfolio charts and trading candlestick charts
- **Lucide React** — icons
- **Docker** multi-stage build (Node 22 → Nginx 1.27)

## Project Structure

```
frontend/
├── src/
│   ├── main.jsx                    # React root
│   ├── App.jsx                     # App shell, routing, theme
│   ├── routes/index.jsx            # Route definitions
│   ├── pages/
│   │   ├── AuthPage.jsx            # Login / Signup
│   │   ├── Dashboard.jsx           # Portfolio overview + market snapshot
│   │   ├── Trade.jsx               # Candlestick chart + order panel
│   │   ├── Portfolio.jsx           # Holdings, wallet, P&L
│   │   ├── Orders.jsx              # Order history and management
│   │   ├── Watchlist.jsx           # Securities watchlist
│   │   ├── Bot.jsx                 # Trading bot controls
│   │   ├── Research.jsx            # Market research
│   │   └── Account.jsx             # Account settings
│   ├── components/
│   │   ├── Header.jsx              # Top navigation
│   │   ├── Sidebar.jsx             # Collapsible left nav (desktop + mobile drawer)
│   │   ├── TradingChart.jsx        # Lightweight-charts wrapper
│   │   ├── OrderPanel.jsx          # Order placement form
│   │   ├── auth/                   # Login/signup subcomponents
│   │   ├── dashboard/              # Dashboard widgets
│   │   └── orders/                 # Order table and hooks
│   └── context/
│       └── MarketDataContext.jsx   # WebSocket + candle aggregation context
├── public/favicon.svg
├── vite.config.js                  # API proxy config
├── nginx.conf                      # Nginx with WebSocket proxy
└── Dockerfile
```

## Pages & Features

| Page | Features |
|------|---------|
| **Dashboard** | Portfolio value + gain/loss, top movers bar chart, watchlist, asset allocation pie |
| **Trade** | 5-min candlestick chart (live), BUY/SELL/MARKET/LIMIT order panel, symbol selector |
| **Portfolio** | Holdings table, P&L, deposit/withdraw, sell positions, equity history chart |
| **Orders** | Order history, active order count, cancel orders, place new orders |
| **Watchlist** | Real-time price monitoring for multiple symbols |
| **Bot** | Activate EMA-strategy bots, configure risk params, start/stop/pause sessions, live decision feed |
| **Auth** | Animated login/signup with JWT token storage |

## Getting Started

### Local Development

```bash
npm install
npm run dev      # Vite dev server at http://localhost:5173
```

Requests to `/api/*` and `/auth/*` are proxied to the backend (configurable via `API_TARGET`).

### Build

```bash
npm run build    # Output to /dist
npm run preview  # Preview production build locally
npm run lint     # ESLint check
```

### Docker

```bash
docker build -t broker-frontend .
docker run -p 80:80 broker-frontend
```

Nginx serves the built assets and proxies WebSocket connections on `/api/ws`.

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `API_TARGET` | `http://localhost:8000` | Backend API base URL (Vite proxy) |

No `.env` file needed — API target is set at build/run time via `vite.config.js`.

**Runtime state (localStorage):**
- `token` — JWT auth token
- `theme` — `light` or `dark`

## Real-Time Data Flow

1. WebSocket connection established at `/api/ws?token=<jwt>` on app mount
2. `PRICE_UPDATE` ticks aggregated into 5-minute candles in `MarketDataContext`
3. Candles persisted to backend every 30 seconds via `PUT /api/candles`
4. `ORDER_UPDATE` messages sync order state in real-time
5. `MARKET_EVENT` messages displayed as notifications

## Default Ticker List

36 pre-configured symbols: ARKA, PHNX, MNVS, STRM, NOVA, BYTE, QNTM, CRUX, ORBT, VRTX, AURA, CRVS, IRON, MRCR, APEX, GILT, VALE, VLCN, SOLX, CLDN, PRMA, HDRG, WNDX, ATLS, HLIX, MEDX, GNTC, CRYO, PLSM, NXGN, DRAX, LUMX, CRST, VOYA, AXEL, MRKT

## Deployment

Multi-stage Docker build produces a minimal Nginx image. Nginx config enables WebSocket proxy pass-through for live market data.
