import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { SectionHeading } from "@/components/SectionHeading";
import Map from "@/components/Map";
import { RouteStepper } from "@/components/RouteStepper";

const cargoCategories = [
  {
    title: "Standard packages",
    description: "Parcels and small business shipments, door to door.",
    weight: "light" as const,
  },
  {
    title: "Bulk goods",
    description: "Palletized or multi-item loads for wholesalers and shops.",
    weight: "light" as const,
  },
  {
    title: "Heavy-duty equipment",
    description:
      "Generators, machinery, and industrial loads that need the right vehicle.",
    weight: "bold" as const,
  },
  {
    title: "Oversized cargo",
    description:
      "Long, wide, or awkward loads planned with route and permit checks.",
    weight: "bold" as const,
  },
];

const lifecycleStages = [
  {
    title: "Request",
    description: "Tell us your pickup, destination, and what you're moving.",
  },
  {
    title: "Quote",
    description: "We price the job based on cargo, distance, and handling.",
  },
  {
    title: "Booking",
    description: "Accept the quote and confirm your pickup window.",
  },
  {
    title: "In transit",
    description: "Your driver is assigned and your shipment is on the road.",
  },
  {
    title: "Delivered",
    description:
      "Proof of delivery lands in your account the moment it's dropped off.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="border-b border-navy-950/10">
        <Container className="grid gap-12 py-12 lg:grid-cols-2 lg:items-center lg:py-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
              One carrier for everything you need moved across Ghana.
            </h1>
            <p className="mt-6 text-lg text-ink-muted leading-relaxed max-w-prose">
              From a single parcel to oversized industrial equipment, Pack &amp;
              Go plans the route, assigns the right vehicle, and keeps you
              updated from pickup to proof of delivery.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/request-delivery">Request a delivery</Button>
              <Button href="/track" variant="secondary">
                Track a shipment
              </Button>
            </div>
          </div>

          <div className="lg:pl-6">
            <Map />
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionHeading
            title="Built for the full range of cargo"
            description="Whichever category your shipment falls into, it moves through the same reliable process."
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {cargoCategories.map((category) => (
              <Card key={category.title} weight={category.weight}>
                <h3 className="font-display text-lg font-semibold">
                  {category.title}
                </h3>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    category.weight === "bold"
                      ? "text-paper/80"
                      : "text-ink-muted"
                  }`}
                >
                  {category.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 bg-navy-950/[0.02] border-y border-navy-950/10">
        <Container>
          <SectionHeading
            title="How a delivery moves through Pack & Go"
            description="Every shipment follows the same five stages, visible in your account the whole way."
          />

          <div className="mt-12">
            <RouteStepper stages={lifecycleStages} />
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container className="rounded-sm bg-navy-950 px-8 py-14 text-center sm:px-16">
          <h2 className="font-display text-3xl font-semibold text-paper">
            Ready to move your next shipment?
          </h2>
          <p className="mt-4 text-paper/70 max-w-xl mx-auto">
            Tell us what you&apos;re shipping and where it needs to go —
            we&apos;ll handle the rest.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button
              href="/request-delivery"
              variant="secondary"
              className="border-paper/30 text-paper hover:border-paper"
            >
              Request a delivery
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
