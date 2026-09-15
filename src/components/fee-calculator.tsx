"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, ArrowRight, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { money, pct, usdt } from "@/lib/format"
import {
  SCENARIOS,
  getScenario,
  quoteRail,
  type DestAsset,
  type ExecutionId,
} from "@/lib/rail"
import { cn } from "@/lib/utils"

const PRESETS = [100_000, 1_000_000, 2_000_000, 2_500_000, 3_000_000]

export function FeeCalculator() {
  const [notional, setNotional] = useState(2_500_000)
  const [scenarioId, setScenarioId] = useState<ExecutionId>("good")
  const [hedge, setHedge] = useState(true)
  const [dest, setDest] = useState<DestAsset>("USDT")
  const [dailyLots, setDailyLots] = useState(1)
  const [btcPrice, setBtcPrice] = useState(100_000)
  const [leverage, setLeverage] = useState(5)
  const [movePct, setMovePct] = useState(1)

  const scenario = getScenario(scenarioId)
  const quote = useMemo(
    () =>
      quoteRail({
        notional,
        scenario,
        hedge,
        dest,
        dailyLots,
        btcPrice,
        leverage,
        unhedgedMovePct: movePct,
      }),
    [notional, scenario, hedge, dest, dailyLots, btcPrice, leverage, movePct],
  )
  const quote100k = useMemo(
    () =>
      quoteRail({
        notional: 100_000,
        scenario,
        hedge,
        dest,
        dailyLots: 1,
        btcPrice,
        leverage,
        unhedgedMovePct: movePct,
      }),
    [scenario, hedge, dest, btcPrice, leverage, movePct],
  )

  const inputInvalid = !Number.isFinite(notional) || notional <= 0

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle>Size the rail</CardTitle>
          <CardDescription>
            Change the ticket, execution quality, and hedge. The quote is a planning model, not a live RFQ.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-end justify-between gap-3">
              <Label htmlFor="notional">USDT to move (one lot)</Label>
              <Input
                id="notional"
                type="number"
                min={1000}
                step={10000}
                value={notional}
                onChange={(e) => setNotional(Number(e.target.value))}
                className="h-9 w-40 text-right font-mono"
              />
            </div>
            <Slider
              min={10000}
              max={5000000}
              step={10000}
              value={[Math.min(Math.max(notional || 0, 10000), 5000000)]}
              onValueChange={(value) => setNotional(firstValue(value, notional))}
            />
            <div className="flex flex-wrap gap-2">
                  {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  data-testid={`preset-${p}`}
                  onClick={() => setNotional(p)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    notional === p
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                  )}
                >
                  {p >= 1_000_000 ? `${p / 1_000_000}M` : "100k"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Execution quality</Label>
            <div className="grid grid-cols-2 gap-2">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  data-testid={`scenario-${s.id}`}
                  onClick={() => setScenarioId(s.id)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-left transition-colors",
                    scenarioId === s.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-foreground/25",
                  )}
                >
                  <div className="text-sm font-medium">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.headline}</div>
                </button>
              ))}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{scenario.detail}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border border-border px-3 py-3">
              <button
                type="button"
                onClick={() => setHedge((on) => !on)}
                className="text-left"
                data-testid="hedge-toggle"
              >
                <div className="text-sm font-medium">Delta-neutral hedge</div>
                <div className="text-xs text-muted-foreground">Short perp vs BTC in transit</div>
              </button>
              <Switch
                checked={hedge}
                onCheckedChange={(checked) => setHedge(Boolean(checked))}
              />
            </div>
            <div className="space-y-2">
              <Label>Destination asset</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["USDT", "USDC"] as const).map((asset) => (
                  <button
                    key={asset}
                    type="button"
                    data-testid={`dest-${asset}`}
                    onClick={() => setDest(asset)}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-sm",
                      dest === asset
                        ? "border-primary bg-primary/10"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {asset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Lots / day"
              value={dailyLots}
              min={1}
              max={6}
              step={1}
              onChange={setDailyLots}
            />
            <Field
              label="BTC price"
              value={btcPrice}
              min={20000}
              max={250000}
              step={1000}
              onChange={setBtcPrice}
            />
            <Field
              label="Hedge leverage"
              value={leverage}
              min={1}
              max={10}
              step={1}
              onChange={setLeverage}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label htmlFor="move">Unhedged BTC move while in transit</Label>
              <span className="font-mono text-muted-foreground">{movePct.toFixed(1)}%</span>
            </div>
            <Slider
              id="move"
              min={0.2}
              max={5}
              step={0.1}
              value={[movePct]}
              onValueChange={(value) => setMovePct(firstValue(value, movePct))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {inputInvalid || !quote ? (
          <Card>
            <CardHeader>
              <CardTitle>Enter a ticket size</CardTitle>
              <CardDescription>
                Set a USDT amount above zero to see net received, the fee waterfall, and what a 1% Bitcoin move would do without a hedge.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden">
              <CardHeader className="border-b">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{scenario.label}</Badge>
                  <Badge variant={hedge ? "default" : "destructive"}>
                    {hedge ? "Hedged" : "Unhedged"}
                  </Badge>
                  <Badge variant="outline">{dest} out</Badge>
                </div>
                <CardTitle
                  data-testid="net-received"
                  className="pt-2 text-3xl font-semibold tracking-tight sm:text-4xl"
                >
                  {usdt(quote.net)} {dest}
                </CardTitle>
                <CardDescription>
                  From {usdt(quote.notional)} USDT in. Haircut {money(quote.totalCost)} ({pct(quote.haircutPct, 3)}
                  , {quote.variableBps.toFixed(1)} bps + flat withdrawal).
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 pt-4 sm:grid-cols-3">
                <Stat
                  label="If you sent 100,000"
                  value={`${usdt(quote100k?.net ?? 0)} out`}
                  hint={`${money(quote100k?.totalCost ?? 0)} lost, flat withdrawal included`}
                />
                <Stat
                  label="This lot in BTC"
                  value={`${quote.btcAmount.toFixed(3)} BTC`}
                  hint={`at ${money(btcPrice, 0)}`}
                />
                <Stat
                  label="Hedge margin to park"
                  value={hedge ? money(quote.marginUsd, 0) : "n/a"}
                  hint={hedge ? `${leverage}× notional, separate USDT` : "Price risk is open"}
                />
              </CardContent>
            </Card>

            {!hedge && (
              <div className="flex gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                <p>
                  A {movePct.toFixed(1)}% Bitcoin move during transit is{" "}
                  <span className="font-medium">{money(quote.unhedgedMoveUsd)}</span> — usually larger than every fee on this ticket combined. Keep the short open until destination sells.
                </p>
              </div>
            )}

            {hedge && (
              <div className="flex gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm">
                <Shield className="mt-0.5 size-4 shrink-0 text-primary" />
                <p>
                  Hedge stays on until destination sells. In-transit BTC is the long; the perp is the short. Closing early leaves you naked. Do not post the BTC you are about to withdraw as the short’s collateral.
                </p>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Fee waterfall</CardTitle>
                <CardDescription>
                  CEX Bitcoin withdrawals are flat. Miner fees are already inside that line for exchange-to-exchange sends.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    {quote.lines.map((line) => (
                      <TableRow key={line.id} className={line.id === "out" ? "border-t-2" : undefined}>
                        <TableCell>
                          <div className="font-medium">{line.label}</div>
                          {line.note ? (
                            <div className="text-xs text-muted-foreground">{line.note}</div>
                          ) : null}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-mono tabular-nums",
                            line.amount < 0 && "text-destructive",
                            line.id === "out" && "text-primary",
                          )}
                        >
                          {line.id === "in" || line.id === "out"
                            ? `${usdt(line.amount)} ${line.id === "out" ? dest : "USDT"}`
                            : money(line.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">If you run this daily</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <Row k={`${dailyLots} lot${dailyLots > 1 ? "s" : ""}/day`} v={money(quote.dailyCost)} />
                  <Row k="30-day friction" v={money(quote.monthlyCost)} />
                  <Row
                    k="Daily notional"
                    v={`${usdt(quote.notional * dailyLots, 0)} USDT`}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">The 100k question</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    <span className="text-foreground">
                      100,000 USDT in → {usdt(quote100k?.net ?? 0)} {dest} out.
                    </span>{" "}
                    Landing at 99,990 (1 bp) would require skipping two conversions. This BTC rail does not do that.
                  </p>
                  <p className="flex items-center gap-2 text-foreground">
                    <ArrowRight className="size-4 text-primary" />
                    Plan for {pct(quote100k?.haircutPct ?? quote.haircutPct, 2)} all-in, not 0.01%.
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function firstValue(value: number | readonly number[], fallback: number): number {
  if (typeof value === "number") return value
  return value[0] ?? fallback
}

function Field({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (n: number) => void
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="font-mono"
      />
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-mono text-lg font-medium tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-mono">{v}</span>
    </div>
  )
}
