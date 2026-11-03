// A number whose changed digits drop in (`digit-in`, styles/motion.css). Each digit is keyed by its place from the right and its value, so React remounts, and so animates, only the digits that changed; on mount every digit drops in once.
export function DigitSwap({ value }: { value: number }) {
  const digits = String(value).split("");
  return (
    <span className="inline-flex overflow-clip">
      {digits.map((digit, i) => (
        <span
          className="inline-block animate-[digit-in_180ms_var(--ease-enter)]"
          key={`${digits.length - i}-${digit}`}
        >
          {digit}
        </span>
      ))}
    </span>
  );
}
