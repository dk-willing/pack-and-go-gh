import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";

export const metadata: Metadata = {
  title: "Freight and Courier Services in Tema",
  description:
    "Pack & Go - GH offers freight and courier services in Tema for commercial cargo, express shipping, and scheduled logistics support.",
};

export default function TemaPage() {
  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-route">
          Ghana logistics
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
          Freight and courier services in Tema
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-ink-muted">
          Whether your operation is based in Tema Port, a nearby industrial
          zone, or a commercial estate, Pack &amp; Go - GH provides dependable
          transport solutions for regular freight, last-mile delivery, and
          time-sensitive cargo.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Button href="/request-delivery">Request a quote</Button>
          <Link
            href="/services"
            className="inline-flex items-center rounded-full border border-navy-950/15 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:border-navy-950/25 hover:bg-paper"
          >
            Explore services
          </Link>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <section className="rounded-2xl border border-navy-950/10 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900">
              Port and industrial logistics
            </h2>
            <p className="mt-3 text-sm leading-7 text-ink-muted">
              We coordinate movement to and from industrial facilities, depots,
              and port-linked operations with timelines built around cargo
              access, vehicle availability, and delivery windows.
            </p>
          </section>

          <section className="rounded-2xl border border-navy-950/10 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900">
              Commercial delivery support
            </h2>
            <p className="mt-3 text-sm leading-7 text-ink-muted">
              Businesses in Tema rely on Pack &amp; Go for regular distribution,
              repeat deliveries, and urgent same-day movement when schedules are
              tight and downtime is costly.
            </p>
          </section>
        </div>
      </div>
    </Container>
  );
}
