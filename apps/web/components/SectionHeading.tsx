import { ReactNode } from "react";

/**
 * Standard heading block used to open a page section.
 * Deliberately has no eyebrow/label slot — see frontend design notes:
 * an all-caps eyebrow above every heading is template chrome, not content.
 */
export function SectionHeading({
  title,
  description,
  align = "left",
}: {
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div
      className={
        align === "center" ? "text-center mx-auto max-w-2xl" : "max-w-xl"
      }
    >
      <h2 className="text-lg sm:text-4xl font-semibold tracking-tight">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-ink-muted sm:text-lg leading-relaxed text-sm">
          {description}
        </p>
      ) : null}
    </div>
  );
}
