export function Newsletter() {
  return (
    <div>
      <h4 className="text-base font-bold text-white">Newsletter</h4>
      <p className="mt-4 text-sm text-white/70">
        Subscribe to get updates on new products and offers.
      </p>
      <form onSubmit={(e) => e.preventDefault()} className="mt-4 space-y-3">
        <input
          type="email"
          placeholder="Enter your email"
          className="h-11 w-full rounded-md border border-white/15 bg-white px-3.5 text-sm text-navy placeholder:text-muted-foreground focus:border-brand-green focus:outline-none"
        />
        <button
          type="submit"
          className="h-11 w-full rounded-md bg-brand-green text-sm font-semibold text-white transition hover:brightness-110"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}
