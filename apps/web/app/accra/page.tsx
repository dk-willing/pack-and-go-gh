import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";

export const metadata: Metadata = {
  title: "Parcel Delivery in Accra",
  description:
    "Pack & Go - GH provides reliable parcel delivery in Accra, business freight movement, and same-day logistics support across Greater Accra.",
};

export default function AccraPage() {
  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-route">
          Ghana logistics
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
          Parcel delivery in Accra and nearby locations
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-ink-muted">
          Pack &amp; Go - GH helps businesses, families, and online sellers move
          packages quickly and securely across Accra, Tema, East Legon, Madina,
          Spintex, and other fast-growing areas in the Greater Accra region.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Button href="/request-delivery">Request a quote</Button>
          <Link
            href="/services"
            className="inline-flex items-center rounded-full border border-navy-950/15 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:border-navy-950/25 hover:bg-paper"
          >
            View all services
          </Link>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <section className="rounded-2xl border border-navy-950/10 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900">
              Same-day delivery and courier support
            </h2>
            <p className="mt-3 text-sm leading-7 text-ink-muted">
              From documents and retail parcels to urgency-sensitive deliveries,
              our team plans fast routes through Accra traffic and coordinates
              the right vehicle for the job. We help reduce delays with live
              updates and route visibility.
            </p>
          </section>

          <section className="rounded-2xl border border-navy-950/10 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900">
              Business logistics for Accra
            </h2>
            <p className="mt-3 text-sm leading-7 text-ink-muted">
              We support stock movement, warehousing handovers, and scheduled
              freight runs for retail teams, offices, construction sites, and
              commercial operators across the capital region.
            </p>
          </section>
        </div>

        <section className="mt-12 rounded-3xl bg-navy-950 px-6 py-8 text-white sm:px-8">
          <h2 className="text-2xl font-semibold">
            Need logistics support in Accra?
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">
            Tell us what you need moved, where it is going, and when it must be
            delivered. We&apos;ll suggest a route, vehicle, and quote built
            around your cargo and timing.
          </p>
        </section>
      </div>
    </Container>
  );
}
