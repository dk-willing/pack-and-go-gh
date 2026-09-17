interface Stage {
  title: string;
  description: string;
}

/**
 * A horizontal stepper for the delivery lifecycle. Numbering is
 * appropriate here — the content genuinely is a sequence — unlike using
 * 01/02/03 markers on unrelated feature cards.
 */
export function RouteStepper({ stages }: { stages: Stage[] }) {
  return (
    <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
      {stages.map((stage, index) => (
        <li key={stage.title} className="relative pl-0">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-navy-950 text-sm font-semibold text-navy-950">
              {index + 1}
            </span>
            {index < stages.length - 1 ? (
              <span
                aria-hidden="true"
                className="hidden sm:block h-px flex-1 bg-navy-950/15"
              />
            ) : null}
          </div>
          <h3 className="mt-4 font-display font-semibold text-navy-950">
            {stage.title}
          </h3>
          <p className="mt-1.5 text-sm text-ink-muted leading-relaxed">
            {stage.description}
          </p>
        </li>
      ))}
    </ol>
  );
}
