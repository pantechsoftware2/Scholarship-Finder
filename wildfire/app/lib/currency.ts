// app/lib/currency.ts
import { EXTRA_COUNTRIES, getCurrencyForCountryCode } from "@/app/lib/countries";

// Optional helper: name -> currency code (e.g. "United Kingdom" -> "GBP")
export function getCurrencyForCountryName(name: string): string | null {
  const found = EXTRA_COUNTRIES.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
  if (!found) return null;
  return getCurrencyForCountryCode(found.code);
}
