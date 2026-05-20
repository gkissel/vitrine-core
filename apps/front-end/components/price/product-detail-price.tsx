export default function ProductDetailPrice({
  amount,
  currencyCode,
}: {
  amount: string;
  currencyCode: string;
}) {
  return (
    <p
      suppressHydrationWarning={true}
      className="text-4xl font-extrabold text-gray-900"
    >
      {new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currencyCode,
        currencyDisplay: "narrowSymbol",
      }).format(parseFloat(amount))}
    </p>
  );
}
