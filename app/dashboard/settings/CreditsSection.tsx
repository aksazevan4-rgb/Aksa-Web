import { Coins, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export interface CreditTransactionItem {
  id: string;
  amount: number;
  reason: string;
  note: string | null;
  createdAt: string;
}

interface Props {
  balance: number;
  transactions: CreditTransactionItem[];
}

const REASON_LABEL: Record<string, string> = {
  ADMIN_GRANT: "Pemberian admin",
  BADGE_PURCHASE: "Beli badge",
  MARKETPLACE_PURCHASE: "Beli item marketplace",
  REFUND: "Pengembalian",
  BONUS: "Bonus",
};

/**
 * app/dashboard/settings/CreditsSection.tsx
 * docs/12-premium-system.md §4 — belum ada pembelian credits mandiri
 * (belum ada payment gateway terhubung), jadi tidak ada tombol "beli"
 * di sini — murni menampilkan saldo & riwayat, konsisten dengan
 * PremiumSection existing yang juga masih manual/admin-confirmed.
 */
export function CreditsSection({ balance, transactions }: Props) {
  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300 flex-shrink-0">
          <Coins size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">
            {balance.toLocaleString("id-ID")} Credits
          </p>
          <p className="text-xs text-text-tertiary mt-0.5">
            Dipakai untuk membeli badge dan item marketplace.
          </p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <p className="text-xs text-text-tertiary">Belum ada riwayat transaksi.</p>
      ) : (
        <div className="space-y-1.5">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between text-xs border-b border-border/60 last:border-0 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                {tx.amount >= 0 ? (
                  <ArrowUpCircle size={13} className="text-emerald-400 flex-shrink-0" />
                ) : (
                  <ArrowDownCircle size={13} className="text-rose-400 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-text-secondary truncate">
                    {tx.note || REASON_LABEL[tx.reason] || tx.reason}
                  </p>
                  <p className="text-text-tertiary text-[10px]">
                    {new Date(tx.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                  </p>
                </div>
              </div>
              <span
                className={`font-mono font-medium flex-shrink-0 ${
                  tx.amount >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {tx.amount >= 0 ? "+" : ""}
                {tx.amount.toLocaleString("id-ID")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
