"use client";

import Link from "next/link";
import { Container } from "./Container";
import { LegalModal } from "./LegalModal";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy-950 text-paper/75">
      <Container className="grid gap-12 py-14 sm:grid-cols-[1.4fr_0.6fr] sm:gap-16 lg:py-16">
        <div className="max-w-md">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-route text-sm font-bold text-navy-950">
              P&amp;G
            </span>
            <p className="font-display text-xl font-semibold tracking-tight text-paper">
              Pack &amp; Go <span className="text-route">GH</span>
            </p>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-7 text-paper/65">
            Nationwide transport for everything from a single parcel to
            oversized industrial equipment.
          </p>
          <p className="mt-5 text-xs font-medium uppercase tracking-[0.18em] text-route/90">
            Moving Ghana forward
          </p>
        </div>

        <div className="sm:justify-self-end sm:min-w-52">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-route">
            Information
          </p>
          <p className="mt-3 text-sm leading-6 text-paper/60">
            Policies for using Pack &amp; Go services.
          </p>
          <div className="mt-5">
            <LegalModal />
          </div>
        </div>
      </Container>

      <Container className="flex flex-col gap-2 border-t border-white/10 py-6 text-xs text-paper/45 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} Pack &amp; Go - GH.</span>
        <span>Nationwide logistics across Ghana.</span>
      </Container>
    </footer>
  );
}
