export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-10 text-ink-muted" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-navy-950/20 border-t-navy-950" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-sm border border-route-dark/30 bg-route-light/40 px-5 py-4">
      <p className="text-sm text-navy-950">{message}</p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="mt-3 text-sm font-medium text-navy-950 underline underline-offset-2"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-sm border border-dashed border-navy-950/15 px-6 py-10 text-center">
      <p className="font-medium text-navy-950">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-ink-muted">{description}</p>
      ) : null}
    </div>
  );
}
