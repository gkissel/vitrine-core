import { DEFAULT_LOCALE } from "lib/constants";

export function formatMoney(
  amount: number | undefined,
  currencyCode: string,
): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: "currency",
    currency: currencyCode || "BRL",
  }).format(amount ?? 0);
}
