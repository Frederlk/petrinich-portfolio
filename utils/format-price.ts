type Price = { amount: number; currency: string };

// "$1,200" for a whole amount, "$1,200.50" otherwise.
export function formatPrice({ amount, currency }: Price): string {
  return new Intl.NumberFormat("en-US", {
    currency,
    style: "currency",
    trailingZeroDisplay: "stripIfInteger",
  }).format(amount);
}
