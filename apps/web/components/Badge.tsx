import { ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-sm bg-route-light px-2.5 py-1 text-xs font-medium text-route-dark">
      {children}
    </span>
  );
}
