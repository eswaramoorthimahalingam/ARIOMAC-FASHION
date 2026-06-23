export function Logo({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex h-12 min-w-[150px] items-center sm:h-16 sm:min-w-[240px] ${className}`}
    >
      <span
        aria-label="ARIOMAC Fashion India"
        className="brand-wordmark text-[2rem] leading-none sm:text-[2.85rem]"
      >
        ARIOMAC
      </span>
    </div>
  );
}
