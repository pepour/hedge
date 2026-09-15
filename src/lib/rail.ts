/** Research-backed cost model for a USDT → BTC on-chain → USDT/USDC rail. */

export type ExecutionId = "weak" | "good" | "excellent" | "otc"
export type DestAsset = "USDT" | "USDC"

export type ScenarioRates = {
  id: ExecutionId
  label: string
  headline: string
  detail: string
  /** Basis points. 10 bps = 0.10%. */
  spotBuyBps: number
  spotSellBps: number
  hedgeOpenBps: number
  hedgeCloseBps: number
  slippageBps: number
  extraStableBps: number
  /** Positive = you pay shorts; negative = shorts receive (typical BTC perp). */
  fundingBps: number
  withdrawUsd: number
}

export type LineItem = {
  id: string
  label: string
  note?: string
  amount: number
}

export type Quote = {
  notional: number
  net: number
  totalCost: number
  haircutPct: number
  variableBps: number
  lines: LineItem[]
  per100k: number
  dailyCost: number
  monthlyCost: number
  marginUsd: number
  btcAmount: number
  unhedgedMoveUsd: number
}

export const SCENARIOS: ScenarioRates[] = [
  {
    id: "weak",
    label: "Retail taker",
    headline: "Market orders, no VIP",
    detail:
      "0.10% spot taker each side, 0.05% perp taker each side, plus 10 bps of book impact. Typical if you dump size as market orders.",
    spotBuyBps: 10,
    spotSellBps: 10,
    hedgeOpenBps: 5,
    hedgeCloseBps: 5,
    slippageBps: 10,
    extraStableBps: 3,
    fundingBps: 0,
    withdrawUsd: 30,
  },
  {
    id: "good",
    label: "VIP maker",
    headline: "Limit orders, mid-tier VIP",
    detail:
      "About 3 bps spot each side and 2 bps perp each side after VIP, with tight limit execution. Realistic target at $2–3M/day.",
    spotBuyBps: 3,
    spotSellBps: 3,
    hedgeOpenBps: 2,
    hedgeCloseBps: 2,
    slippageBps: 2,
    extraStableBps: 2,
    fundingBps: 0,
    withdrawUsd: 25,
  },
  {
    id: "excellent",
    label: "Desk grade",
    headline: "High VIP + maker + timing",
    detail:
      "2 bps spot, 1 bp perp, 2 bps residual spread. Funding often a small credit if you are short through a positive print. 1 bp all-in is not this path.",
    spotBuyBps: 2,
    spotSellBps: 2,
    hedgeOpenBps: 1,
    hedgeCloseBps: 1,
    slippageBps: 2,
    extraStableBps: 1,
    fundingBps: -0.7,
    withdrawUsd: 20,
  },
  {
    id: "otc",
    label: "OTC RFQ",
    headline: "Locked quotes, spread in the price",
    detail:
      "Institutional BTC RFQs around $1–10M often sit 8–20 bps off mid per side. Two conversions plus a cheap hedge.",
    spotBuyBps: 12,
    spotSellBps: 12,
    hedgeOpenBps: 2,
    hedgeCloseBps: 2,
    slippageBps: 0,
    extraStableBps: 2,
    fundingBps: 0,
    withdrawUsd: 25,
  },
]

export function getScenario(id: ExecutionId): ScenarioRates {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[1]
}

export function quoteRail(opts: {
  notional: number
  scenario: ScenarioRates
  hedge: boolean
  dest: DestAsset
  dailyLots: number
  btcPrice: number
  leverage: number
  unhedgedMovePct: number
}): Quote | null {
  const { notional, scenario, hedge, dest, dailyLots, btcPrice, leverage, unhedgedMovePct } =
    opts
  if (!Number.isFinite(notional) || notional <= 0) return null
  if (!Number.isFinite(btcPrice) || btcPrice <= 0) return null

  const hedgeOpen = hedge ? scenario.hedgeOpenBps : 0
  const hedgeClose = hedge ? scenario.hedgeCloseBps : 0
  const funding = hedge ? scenario.fundingBps : 0
  const extra = dest === "USDC" ? scenario.extraStableBps : 0

  const spotBuy = notional * (scenario.spotBuyBps / 10_000)
  const slippage = notional * (scenario.slippageBps / 10_000)
  const hedgeOpenUsd = notional * (hedgeOpen / 10_000)
  const withdraw = scenario.withdrawUsd
  const spotSell = notional * (scenario.spotSellBps / 10_000)
  const hedgeCloseUsd = notional * (hedgeClose / 10_000)
  const fundingUsd = notional * (funding / 10_000)
  const extraUsd = notional * (extra / 10_000)

  const lines: LineItem[] = [
    { id: "in", label: "USDT posted at origin", amount: notional },
    {
      id: "buy",
      label: "Spot buy BTC",
      note: `${scenario.spotBuyBps.toFixed(1)} bps`,
      amount: -spotBuy,
    },
    {
      id: "slip",
      label: "Spread / slippage (round-trip)",
      note: `${scenario.slippageBps.toFixed(1)} bps`,
      amount: -slippage,
    },
  ]

  if (hedge) {
    lines.push({
      id: "hedge-open",
      label: "Open BTC perpetual short",
      note: `${hedgeOpen.toFixed(1)} bps`,
      amount: -hedgeOpenUsd,
    })
  }

  lines.push({
    id: "withdraw",
    label: "CEX Bitcoin withdrawal",
    note: "flat, not a % of size",
    amount: -withdraw,
  })
  lines.push({
    id: "sell",
    label: `Spot sell BTC → ${dest === "USDC" ? "USDT, then USDC" : "USDT"}`,
    note: `${scenario.spotSellBps.toFixed(1)} bps`,
    amount: -spotSell,
  })

  if (hedge) {
    lines.push({
      id: "hedge-close",
      label: "Close perpetual short",
      note: `${hedgeClose.toFixed(1)} bps`,
      amount: -hedgeCloseUsd,
    })
    lines.push({
      id: "funding",
      label: "Perp funding while in transit",
      note:
        funding < 0
          ? `${Math.abs(funding).toFixed(1)} bps credit if shorts receive`
          : `${funding.toFixed(1)} bps`,
      amount: -fundingUsd,
    })
  }

  if (dest === "USDC") {
    lines.push({
      id: "usdc",
      label: "USDT → USDC at destination",
      note: `${extra.toFixed(1)} bps`,
      amount: -extraUsd,
    })
  }

  const totalCost =
    spotBuy +
    slippage +
    hedgeOpenUsd +
    withdraw +
    spotSell +
    hedgeCloseUsd +
    fundingUsd +
    extraUsd
  const net = notional - totalCost
  const variableBps =
    scenario.spotBuyBps +
    scenario.spotSellBps +
    hedgeOpen +
    hedgeClose +
    scenario.slippageBps +
    funding +
    extra

  lines.push({ id: "out", label: `${dest} received at destination`, amount: net })

  const lev = Math.max(leverage, 1)
  const dailyNotional = notional * Math.max(dailyLots, 1)

  return {
    notional,
    net,
    totalCost,
    haircutPct: (totalCost / notional) * 100,
    variableBps,
    lines,
    per100k: (totalCost / notional) * 100_000,
    dailyCost: (totalCost / notional) * dailyNotional,
    monthlyCost: (totalCost / notional) * dailyNotional * 30,
    marginUsd: hedge ? notional / lev : 0,
    btcAmount: notional / btcPrice,
    unhedgedMoveUsd: notional * (unhedgedMovePct / 100),
  }
}

export const RESEARCH = {
  asOf: "September 2026",
  network: {
    mempoolFastestSatVb: 1,
    typicalUsd: "about $0.10–$2 in calm conditions; a few dollars if you pay for the next block",
    rule: "Bitcoin fees are per vbyte, not per dollar. $100 and $3,000,000 of the same shape cost the same miner fee.",
  },
  cexWithdraw: {
    binanceRange: "published figures vary from ~0.000015 BTC to ~0.0005 BTC as venues reprice dynamically",
    okxRange: "commonly quoted ~0.0002–0.0004 BTC on mainnet",
    usdBand: "$10–$40 is the working band for a single CEX BTC withdrawal",
  },
  spot: {
    binanceRegular: "0.10% maker / 0.10% taker (0.075% if paying with BNB)",
    vip3: "Binance VIP 3: 0.040% maker / 0.060% taker, needs ~$20M 30-day volume plus BNB",
    vip4: "Binance VIP 4: 0.040% / 0.052%, needs ~$75M 30-day volume",
    volumeNote:
      "At $2.5M/day you print about $75M of 30-day notional on the origin venue from buys alone — VIP 3–4 is the right planning bucket, not retail 10 bps.",
  },
  perp: {
    base: "Binance / OKX USD-M base: 0.020% maker / 0.050% taker. Bybit: 0.020% / 0.055%.",
    vip: "Mid VIP perp taker is typically 2.5–4.0 bps; makers sit near 1–2 bps.",
  },
  funding: {
    interval: "BTCUSDT perps fund every 8 hours (00:00, 08:00, 16:00 UTC on Binance).",
    mean: "Long-run mean around +0.0074% per 8h interval; positive most of the time, so shorts usually receive.",
    transit:
      "A 10–40 minute transfer usually misses funding. If you straddle a print, budget ~0.5–1.0 bp either way — noise versus a 1% spot move.",
  },
  otc: {
    size: "$1M–$10M BTC RFQs: roughly 10–20 bps off mid at a typical desk; 5–15 bps with a real relationship.",
    vsBook:
      "OTC wins when book impact would be worse than the quoted spread. $2–3M of BTC is still small versus top CEX books if you make, so VIP maker often beats a lazy RFQ.",
  },
  lightning:
    "Lightning is the wrong rail at this size. Some CEX Lightning rails cap near 0.05 BTC per invoice and 0.5 BTC per day.",
} as const
