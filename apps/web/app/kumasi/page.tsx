import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";

export const metadata: Metadata = {
  title: "Cargo Delivery in Kumasi",
  description:
    "Discover reliable cargo delivery in Kumasi with Pack & Go - GH for freight, retail shipments, industrial movement, and intercity logistics.",
};

export default function KumasiPage() {
  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-route">
          Ghana logistics
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
          Cargo and freight delivery in Kumasi
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-ink-muted">
          Pack &amp; Go - GH serves businesses, wholesalers, and individuals in
          Kumasi with dependable delivery solutions for parcels, palletized
          loads, bulk cargo, and heavy equipment movement across the region.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Button href="/request-delivery">Request a quote</Button>
          <Link
            href="/services"
            className="inline-flex items-center rounded-full border border-navy-950/15 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:border-navy-950/25 hover:bg-paper"
          >
            View services
          </Link>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <section className="rounded-2xl border border-navy-950/10 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900">
              Regional freight and bulk delivery
            </h2>
            <p className="mt-3 text-sm leading-7 text-ink-muted">
              We move bulk goods, pallet loads, retail stock, and commercial
              freight in and around Kumasi with route planning, vehicle
              matching, and transparent pricing based on cargo type and
              distance.
            </p>
          </section>

          <section className="rounded-2xl border border-navy-950/10 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900">
              Heavy transport and industrial movement
            </h2>
            <p className="mt-3 text-sm leading-7 text-ink-muted">
              Construction supplies, industrial equipment, and machinery can be
              transported with the right lowbed or flatbed setup and route
              planning designed for safer, more efficient heavy cargo moves.
            </p>
          </section>
        </div>
      </div>
    </Container>
  );
}
