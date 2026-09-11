"use client";

import { Loader2, RefreshCw, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { FraudCheck, FraudCourier } from "@/lib/orders";
import { cn } from "@/lib/utils";

type Tone = "good" | "warn" | "bad" | "none";

function rateTone(rate: number | null): Tone {
  if (rate === null) return "none";
  if (rate >= 80) return "good";
  if (rate >= 50) return "warn";
  return "bad";
}

const TONE_TEXT: Record<Tone, string> = {
  good: "text-emerald-600 dark:text-emerald-400",
  warn: "text-amber-600 dark:text-amber-400",
  bad: "text-red-600 dark:text-red-400",
  none: "text-muted-foreground",
};

const TONE_STROKE: Record<Tone, string> = {
  good: "#16a34a",
  warn: "#ea8a1a",
  bad: "#dc2626",
  none: "#94a3b8",
};

/** A small ring, filled to `rate` percent and toned by it — the table cell's
 * at-a-glance read before anyone looks at the numbers next to it. */
function Ring({ rate, size = 40 }: { rate: number | null; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const pct = rate === null ? 0 : Math.max(0, Math.min(100, rate));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0" aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={5}
        className="text-muted-foreground/25"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={TONE_STROKE[rateTone(rate)]}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * c} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

/**
 * The order table's Success Rate column: a ring plus the three figures staff
 * judge a customer by at a glance — the success rate, the success/total
 * parcel count it's built on, and BDCourier's rating for the number.
 */
export function FraudBadge({ fraud }: { fraud: FraudCheck | null }) {
  if (!fraud) return <span className="text-muted-foreground">—</span>;
  if (fraud.error) {
    return (
      <span className="text-xs text-muted-foreground" title={fraud.error}>
        Check failed
      </span>
    );
  }
  if (fraud.total === 0 && fraud.reports.length === 0) {
    return <span className="text-muted-foreground">0</span>;
  }
  const tone = rateTone(fraud.successRate);
  return (
    <div className="flex items-center gap-2">
      <Ring rate={fraud.successRate} />
      <div className="flex flex-col text-xs leading-tight">
        <span className={cn("font-medium", TONE_TEXT[tone])}>
          Success: {fraud.successRate === null ? "—" : `${Math.round(fraud.successRate)}%`}
        </span>
        <span className={TONE_TEXT[tone]}>
          Order: {fraud.success}/{fraud.total}
        </span>
        <span className="text-muted-foreground">
          Rating: {fraud.rating ?? "—"}
        </span>
        {fraud.reports.length > 0 && (
          <span className="mt-0.5 flex items-center gap-1 font-medium text-[#dc2626]">
            <ShieldAlert className="size-3" />
            {fraud.reports.length} fraud report{fraud.reports.length === 1 ? "" : "s"}
          </span>
        )}
      </div>
    </div>
  );
}

const KNOWN_COURIERS = ["pathao", "steadfast", "redx", "carrybee"];

function courierRate(c: FraudCourier | undefined): number | null {
  if (!c) return null;
  if (c.successRate !== null) return c.successRate;
  return c.total > 0 ? (c.success / c.total) * 100 : null;
}

function CourierCard({
  title,
  courier,
  onRefresh,
  refreshing,
}: {
  title: string;
  courier: FraudCourier | undefined;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const rate = courierRate(courier);
  const tone = rateTone(rate);
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex items-center gap-2 border-b bg-muted px-3 py-1.5">
        {courier?.logo && (
          // eslint-disable-next-line @next/next/no-img-element -- remote logo from BDCourier, not a local asset
          <img
            src={courier.logo}
            alt=""
            className="size-4 shrink-0 rounded-sm object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}
        <span className="flex-1 truncate text-xs font-semibold">{title}</span>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh"
            className="text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
          </button>
        )}
      </div>
      <dl className="grid grid-cols-2 gap-x-2 gap-y-1 px-3 py-2 text-xs">
        <dt className="text-muted-foreground">Success Rate</dt>
        <dd className={cn("text-right font-medium", TONE_TEXT[tone])}>
          {rate === null ? "—" : `${Math.round(rate)}%`}
        </dd>
        <dt className="text-muted-foreground">Total</dt>
        <dd className="text-right font-medium">{courier?.total ?? "—"}</dd>
        <dt className="text-muted-foreground">Success</dt>
        <dd className="text-right font-medium">{courier?.success ?? "—"}</dd>
        <dt className="text-muted-foreground">Cancelled</dt>
        <dd className="text-right font-medium">{courier?.cancel ?? "—"}</dd>
      </dl>
      <div className="h-1 bg-muted">
        <div
          className="h-full"
          style={{
            width: rate === null ? "0%" : `${Math.max(0, Math.min(100, rate))}%`,
            background: TONE_STROKE[tone],
          }}
        />
      </div>
    </div>
  );
}

/**
 * The full courier-history picture: a red banner listing any fraud reports,
 * then a card per courier (BDCourier's Overall summary plus the couriers we
 * ship with) so staff can see where a bad number's history actually is.
 *
 * Used in the order detail modal and the manual-order page, both of which
 * decide for themselves when to fetch — this component only renders.
 */
export function FraudCards({
  fraud,
  loading,
  onRefresh,
}: {
  fraud: FraudCheck | null;
  loading?: boolean;
  onRefresh?: () => void;
}) {
  if (loading && !fraud) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Checking courier history…
      </div>
    );
  }

  if (!fraud) return null;

  if (fraud.error) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed p-3 text-sm">
        <span className="text-muted-foreground">{fraud.error}</span>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
            {loading && <Loader2 className="size-3.5 animate-spin" />}
            Retry
          </Button>
        )}
      </div>
    );
  }

  const findCourier = (key: string) =>
    fraud.couriers.find(
      (c) => c.key.toLowerCase().includes(key) || c.name.toLowerCase().includes(key)
    );

  return (
    <div className="flex flex-col gap-2">
      {fraud.reports.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-[#dc2626]/40 bg-[#dc2626]/5 px-3 py-2 text-xs text-[#dc2626]">
          <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
          <div>
            <span className="font-medium">
              {fraud.reports.length} fraud report{fraud.reports.length === 1 ? "" : "s"} filed against this number
            </span>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[#dc2626]/90">
              {fraud.reports.map((r) => (
                <li key={r.id}>
                  {r.courierName ? `${r.courierName}: ` : ""}
                  {r.details || "No details given"}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <CourierCard
          title="Overall"
          courier={{
            key: "overall",
            name: "Overall",
            total: fraud.total,
            success: fraud.success,
            cancel: fraud.cancel,
            successRate: fraud.successRate,
            logo: null,
          }}
          onRefresh={onRefresh}
          refreshing={loading}
        />
        {KNOWN_COURIERS.map((key) => (
          <CourierCard
            key={key}
            title={key[0].toUpperCase() + key.slice(1)}
            courier={findCourier(key)}
          />
        ))}
      </div>
    </div>
  );
}
