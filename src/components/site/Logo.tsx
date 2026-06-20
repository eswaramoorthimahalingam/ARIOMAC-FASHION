export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-start leading-none ${className}`}>
      <span className="font-serif text-2xl tracking-[0.25em] text-gradient-gold font-semibold">
        ARIOMAC
      </span>
      <span className="text-[9px] tracking-[0.4em] text-muted-foreground mt-0.5">
        FASHION · INDIA
      </span>
    </div>
  );
}