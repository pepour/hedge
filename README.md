# BTC Rail Desk

English research playbook for moving large USDT tickets when Tether cannot go straight to the destination: convert to Bitcoin, send BTC on-chain, sell back to USDT or USDC, and hedge Bitcoin price risk while the coins are in transit.

This is a planning desk, not a live exchange. Quotes are models built from public 2026 VIP fee schedules, OTC spread surveys, and mempool snapshots.

## What it answers

- How to run a **USDT → BTC → USDT/USDC** rail without taking BTC direction.
- What a **delta-neutral hedge** (spot long + perpetual short) actually requires, including spare margin.
- What you keep from **100,000 USDT** and from a **$2–3M daily** clip after fees.

Realistic hedged all-in is about **8–20 bps** with VIP maker execution. Retail takers can pay ~**40 bps**. Getting **99,990** back from **100,000** (1 bp) is not this path.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43187](http://127.0.0.1:43187).

```bash
npm run build
npm start
```

## Deploy with Docker Compose

On the server (Docker Engine + Compose plugin):

```bash
git clone <this-repo>
cd <repo>
docker compose up -d --build
```

Then open `http://SERVER_IP` (port **80**).

Use another host port if 80 is taken:

```bash
HOST_PORT=43187 docker compose up -d --build
```

Useful commands:

```bash
docker compose logs -f web
docker compose ps
docker compose down
```

Rebuild after a code pull:

```bash
git pull
docker compose up -d --build
```

## GitHub Pages

The site is a static export. After this repo is on GitHub (`pepour/hedge`):

1. **Settings → Pages → Build and deployment → Source:** GitHub Actions
2. Push `main` (or run the **GitHub Pages** workflow by hand)

The live URL is:

**https://pepour.github.io/hedge/**

The workflow sets `BASE_PATH=/hedge` so assets load under that project path. For a custom domain or a user site (`username.github.io`), set the repo Actions variable `BASE_PATH` to empty.

Local static build:

```bash
npm run build:pages
```

Output is in `out/`.

## How to read the calculator

1. Set the USDT lot size (presets include 100k and 2–3M).
2. Pick execution: retail taker, VIP maker, desk-grade, or OTC RFQ.
3. Leave the hedge on unless you want to see what a 1% Bitcoin move costs in transit.
4. Choose USDT or USDC at the destination.

The waterfall treats the CEX Bitcoin withdrawal as a **flat dollar fee**. Miner fees are not a percentage of notional; a $3M send of the same shape costs the same block space as a small payment.

## Operating notes

- Open the short when you buy spot. Close it when destination **sells**, not when the txid appears.
- Do not use the BTC you are withdrawing as hedge collateral.
- Park roughly **$400k–$800k** USDT margin against a $2.5–3.0M short at 3–7×.
- $2–3M/day will trigger KYC / AML review. This rail converts and settles; it does not hide funds.

## Research sources (planning ranges)

- [mempool.space recommended fees](https://mempool.space/api/v1/fees/recommended)
- Binance / OKX / Bybit public VIP spot and USD-M perpetual schedules
- OTC spread surveys for $1M–$10M BTC RFQs (roughly 10–20 bps off mid at a typical desk)
- Binance BTCUSDT funding history (long-run mean near +0.0074% per 8h; shorts usually receive)
