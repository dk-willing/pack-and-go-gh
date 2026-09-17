import { ReactNode } from "react";

type Weight = "light" | "bold";

/**
 * A single card primitive with two visual weights rather than one
 * identical treatment for everything — used, for example, to let heavier
 * cargo categories read as visually heavier on the services page.
 */
export function Card({
  children,
  weight = "light",
  className = "",
}: {
  children: ReactNode;
  weight?: Weight;
  className?: string;
}) {
  const weightClasses =
    weight === "bold"
      ? "bg-navy-950 text-paper border border-navy-950"
      : "bg-white text-ink border border-navy-950/10";

  return (
    <div className={`rounded-sm p-6 ${weightClasses} ${className}`}>{children}</div>
  );
}
