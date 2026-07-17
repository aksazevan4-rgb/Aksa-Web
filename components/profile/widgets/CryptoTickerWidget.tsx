/**
 * components/profile/widgets/CryptoTickerWidget.tsx
 *
 * Presentational only — TIDAK fetch di sini, alasan sama seperti
 * RssFeedWidget.tsx (async Server Component tidak bisa langsung diimpor
 * ke ExtraWidgets.tsx yang "use client"). fetchCryptoPrices diekspor untuk
 * dipanggil dari app/[username]/page.tsx.
 *
 * Memakai CoinGecko public "simple price" endpoint (tidak butuh API key),
 * di-cache 5 menit lewat Next.js fetch cache (docs/03-backend-architecture.md §3).
 *
 * CATATAN JUJUR: hanya mendukung simbol yang ada di SYMBOL_TO_COINGECKO_ID
 * di bawah — simbol di luar daftar ini diabaikan diam-diam.
 */

const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  XRP: "ripple",
  BNB: "binancecoin",
  DOGE: "dogecoin",
  ADA: "cardano",
  USDT: "tether",
  USDC: "usd-coin",
  MATIC: "matic-network",
};

export async function fetchCryptoPrices(symbols: string[]): Promise<Record<string, number>> {
  const ids = symbols.map((s) => SYMBOL_TO_COINGECKO_ID[s.toUpperCase()]).filter(Boolean);
  if (ids.length === 0) return {};

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd`;
    const res = await fetch(url, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return {};

    const data = (await res.json()) as Record<string, { usd?: number }>;
    const result: Record<string, number> = {};
    for (const symbol of symbols) {
      const id = SYMBOL_TO_COINGECKO_ID[symbol.toUpperCase()];
      if (id && data[id]?.usd !== undefined) {
        result[symbol.toUpperCase()] = data[id].usd!;
      }
    }
    return result;
  } catch (error) {
    console.error("[CRYPTO_TICKER_WIDGET_ERROR]", error);
    return {};
  }
}

export function CryptoTickerWidget({ prices }: { prices: Record<string, number> }) {
  const entries = Object.entries(prices);
  if (entries.length === 0) return null;

  return (
    <div className="glass-bright rounded-2xl p-4 flex flex-wrap gap-3">
      {entries.map(([symbol, price]) => (
        <div key={symbol} className="flex items-center gap-1.5 text-sm">
          <span className="font-medium text-text-primary">{symbol}</span>
          <span className="text-text-tertiary font-mono">
            ${price.toLocaleString("en-US", { maximumFractionDigits: price < 1 ? 4 : 2 })}
          </span>
        </div>
      ))}
    </div>
  );
}
