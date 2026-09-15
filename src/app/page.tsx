import type { ReactNode } from "react"
import {
  ArrowDown,
  Bitcoin,
  BookOpen,
  Calculator,
  Gauge,
  ShieldAlert,
} from "lucide-react"
import { FeeCalculator } from "@/components/fee-calculator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RESEARCH } from "@/lib/rail"

const NAV = [
  { href: "#calculator", label: "Calculator" },
  { href: "#playbook", label: "Playbook" },
  { href: "#hedge", label: "Hedge" },
  { href: "#research", label: "Fees" },
  { href: "#risks", label: "Risks" },
]

export default function Home() {
  return (
    <div className="min-h-full bg-[radial-gradient(1200px_circle_at_top,oklch(0.28_0.04_75_/_0.35),transparent_55%)]">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 font-medium">
            <Bitcoin className="size-5 text-primary" />
            <span>BTC Rail Desk</span>
          </div>
          <nav className="flex flex-wrap gap-1 text-sm text-muted-foreground">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-1 hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-16 px-4 py-10 sm:px-6 sm:py-14">
        <section className="space-y-6">
          <Badge variant="secondary">English research playbook · {RESEARCH.asOf}</Badge>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Move USDT as Bitcoin, land USDT or USDC, and stay off Bitcoin price risk.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            You cannot send Tether straight to the destination, so Bitcoin is only the rail: buy BTC, send it on-chain, sell it on the other side. Economically it is USDT in and USDT (or USDC) out. The job is to hedge the BTC that sits in transit so a 1% coin move does not wipe a day’s fees — or worse.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Callout
              k="Realistic all-in"
              v="8–20 bps hedged"
              d="VIP maker. Retail takers pay ~40 bps. 1 bp is not this path."
            />
            <Callout
              k="On $100,000"
              v="99,800–99,920 out"
              d="Not 99,990. Network fees are noise; conversions are the bill."
            />
            <Callout
              k="$2.5M daily"
              v="~$2k–$5k friction"
              d="Poor execution can push that toward $10k. Hedge margin is extra capital, not a fee."
            />
          </div>
        </section>

        <section id="calculator" className="scroll-mt-20 space-y-6">
          <SectionHead
            icon={<Calculator className="size-4" />}
            title="Net-received calculator"
            text="Model one lot, then scale by lots per day. Toggle the hedge to see why price risk dominates miner fees."
          />
          <FeeCalculator />
        </section>

        <section id="playbook" className="scroll-mt-20 space-y-6">
          <SectionHead
            icon={<BookOpen className="size-4" />}
            title="What to do, in order"
            text="Same economic entity should control origin hedge and destination sale timing. If destination is a third party, they must sell on a pre-agreed signal so you can flatten the short."
          />
          <ol className="grid gap-4 md:grid-cols-2">
            {STEPS.map((step, i) => (
              <li key={step.title} className="rounded-xl border border-border bg-card p-4">
                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono text-primary">0{i + 1}</span>
                  {step.kicker}
                </div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="hedge" className="scroll-mt-20 space-y-6">
          <SectionHead
            icon={<Gauge className="size-4" />}
            title="How the hedge actually works"
            text="Delta-neutral means every bitcoin you own — including the coins sitting in the mempool — is offset by a short of the same USDT notional."
          />
          <Card>
            <CardHeader>
              <CardTitle>The book while coins are in flight</CardTitle>
              <CardDescription>Close the short only after destination’s sell fills.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
              <BookSide
                title="Origin"
                items={["USDT spent on spot BTC", "Short BTC perp still open", "Dedicated USDT margin, not the withdrawn coins"]}
              />
              <ArrowDown className="mx-auto size-5 text-primary md:rotate-[-90deg]" />
              <BookSide
                title="In transit"
                items={["Economic long = BTC on-chain", "Economic short = perp", "Net delta ≈ 0 plus a few bps of basis"]}
              />
              <ArrowDown className="mx-auto size-5 text-primary md:rotate-[-90deg]" />
              <BookSide
                title="Destination"
                items={["BTC credited, sold to USDT/USDC", "Signal origin to buy back the short", "Hedge margin is freed"]}
              />
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Rules that keep you alive</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>Open the short in the same second you buy spot. Size in USDT notional, not “about N BTC”.</p>
                <p>Park hedge collateral in a separate futures balance. Unified accounts that treat in-flight BTC as margin will liquidate you if price rips after the withdrawal.</p>
                <p>Use 3–7×, not 20×. On a $2.5–3.0M ticket that means roughly $400k–$800k of USDT sitting idle for an hour. That capital is a lock, not a cost.</p>
                <p>Do not flatten the short because the txid appeared. Flatten when destination has sold. If they delay, you are still long the coins they hold.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>What the hedge does not kill</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  <span className="text-foreground">Basis.</span> Spot and the perpetual can drift a few bps. In a crash the basis can gap. Same-venue hedge is cleaner than a third venue.
                </p>
                <p>
                  <span className="text-foreground">Funding.</span> {RESEARCH.funding.interval} {RESEARCH.funding.mean} {RESEARCH.funding.transit}
                </p>
                <p>
                  <span className="text-foreground">Operational lag.</span> Withdrawal queues, extra confirmations, and AML holds extend hedge time. Fees stay small; operational risk does not.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="research" className="scroll-mt-20 space-y-6">
          <SectionHead
            icon={<Bitcoin className="size-4" />}
            title="Fee research"
            text="Figures below are planning ranges from public VIP schedules, OTC desk surveys, and mempool snapshots in 2026. Always read the live withdrawal screen before sending."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <ResearchCard
              title="Bitcoin network"
              rows={[
                ["Current recommended fee", `${RESEARCH.network.mempoolFastestSatVb} sat/vB (mempool.space, all targets)`],
                ["Typical payment", RESEARCH.network.typicalUsd],
                ["Scaling law", RESEARCH.network.rule],
                ["For $3M", "One large tx. Splitting into many txs only adds bytes."],
              ]}
            />
            <ResearchCard
              title="CEX BTC withdrawal"
              rows={[
                ["Binance (dynamic)", RESEARCH.cexWithdraw.binanceRange],
                ["OKX mainnet quotes", RESEARCH.cexWithdraw.okxRange],
                ["Working USD band", RESEARCH.cexWithdraw.usdBand],
                ["Deposits", "Receiving venue is usually free; wait 1–2 BTC confirmations."],
              ]}
            />
            <ResearchCard
              title="Spot conversion"
              rows={[
                ["Retail Binance", RESEARCH.spot.binanceRegular],
                ["VIP 3", RESEARCH.spot.vip3],
                ["VIP 4", RESEARCH.spot.vip4],
                ["Your volume", RESEARCH.spot.volumeNote],
              ]}
            />
            <ResearchCard
              title="Hedge + OTC"
              rows={[
                ["Perp base", RESEARCH.perp.base],
                ["Perp VIP", RESEARCH.perp.vip],
                ["OTC $1–10M", RESEARCH.otc.size],
                ["Book vs RFQ", RESEARCH.otc.vsBook],
              ]}
            />
          </div>
          <p className="text-sm text-muted-foreground">{RESEARCH.lightning}</p>
        </section>

        <section id="risks" className="scroll-mt-20 space-y-6">
          <SectionHead
            icon={<ShieldAlert className="size-4" />}
            title="Do this / don’t do that"
            text="$2–3M a day will hit KYC, Travel Rule, and source-of-funds review on any serious venue. This rail converts and settles. It does not hide origin."
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Do</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {DOS.map((t) => (
                  <p key={t}>• {t}</p>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Don’t</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {DONTS.map((t) => (
                  <p key={t}>• {t}</p>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl space-y-2 px-4 py-8 text-xs leading-relaxed text-muted-foreground sm:px-6">
          <p>
            Planning model only. Exchange VIP tiers, withdrawal fees, funding, and mempool rates move. Confirm live fees on the venue before you send. Not investment, tax, or legal advice.
          </p>
        </div>
      </footer>
    </div>
  )
}

function SectionHead({
  icon,
  title,
  text,
}: {
  icon: ReactNode
  title: string
  text: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-xs font-medium tracking-wide uppercase">{title}</span>
      </div>
      <Separator />
      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  )
}

function Callout({ k, v, d }: { k: string; v: string; d: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/70 p-4">
      <div className="text-xs text-muted-foreground">{k}</div>
      <div className="mt-1 font-mono text-lg font-medium">{v}</div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{d}</p>
    </div>
  )
}

function BookSide({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl bg-muted/50 p-4">
      <div className="mb-2 text-sm font-medium">{title}</div>
      <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function ResearchCard({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map(([k, v]) => (
          <div key={k}>
            <div className="text-xs text-muted-foreground">{k}</div>
            <p className="text-sm leading-relaxed">{v}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

const STEPS = [
  {
    kicker: "Prep",
    title: "Stand up two KYC’d venues and a test send",
    body: "Confirm BTC deposit/withdraw is live, read the destination confirmation count, raise daily limits, and send 0.01 BTC to the exact address before the first real lot.",
  },
  {
    kicker: "Capital",
    title: "Ring-fence hedge margin",
    body: "Keep a USDT futures balance that is not the coins you will withdraw. Plan $400k–$800k against a $2.5–3.0M short. If origin spends every last USDT on spot, the short has nothing to live on.",
  },
  {
    kicker: "Execute",
    title: "Buy spot and short the same notional",
    body: "Maker / TWAP on spot. IOC or maker on the perp. No $3M market dump. One lot of ~$0.8–1.0M is easier to flatten than a single $3M clip if something sticks.",
  },
  {
    kicker: "Rail",
    title: "Withdraw native Bitcoin immediately",
    body: "Mainnet BTC, not wrapped, not Lightning at this size. Pay for 1–3 blocks. Cheap economy fees that sit for hours leave the hedge on longer than it needs to be.",
  },
  {
    kicker: "Land",
    title: "Sell as soon as the venue credits",
    body: "Pre-stage destination sell limits. Convert to USDT, or to USDC if that is what they can withdraw. An extra stable-to-stable hop is usually 1–3 bps, not 10.",
  },
  {
    kicker: "Flatten",
    title: "Close the short on the sell print",
    body: "When destination is filled, buy back the perp. Log fill prices. Residual P&L should be fees, funding, and a few bps of basis — not a directional BTC bet.",
  },
  {
    kicker: "Scale",
    title: "Prove the loop, then size up",
    body: "10k → 100k → 1M → full clip. Watch withdrawal holds. $2–3M/day is a compliance event even when the economics are clean.",
  },
  {
    kicker: "Hours",
    title: "Mind the funding clock",
    body: "If the predicted BTC funding print is large and you would pay as a short, wait a few minutes after 00:00 / 08:00 / 16:00 UTC. Skipping one interval is worth more than squeezing miner fees.",
  },
]

const DOS = [
  "Make on the book or RFQ a real desk. Liquidity is not the problem; taker fees and impact are.",
  "Keep one large on-chain transaction per lot. The miner does not care that it is $3M.",
  "Agree destination asset in advance: USDT vs USDC vs something thinner.",
  "Treat hedge P&L and spot P&L as one book. If BTC rips, the short loses and the coins in transit win.",
  "Expect AML questionnaires. Have a lawful commercial story for the flow.",
]

const DONTS = [
  "Collateralize the short with the BTC you are withdrawing.",
  "Close the hedge when you see the txid instead of when destination sells.",
  "Use 20× on a $3M short to 'save' margin.",
  "Assume 99,990 USDT back from 100,000. That is 1 bp; this rail is a two-sided conversion.",
  "Use this as a way to obscure funds. Large BTC deposits get the same review as large USDT deposits.",
]
