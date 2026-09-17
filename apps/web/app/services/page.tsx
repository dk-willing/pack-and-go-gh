import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Card } from "@/components/Card";

const services = [
  {
    title: "Standard package delivery",
    description: "Point-to-point delivery for parcels and small business shipments.",
    weight: "light" as const,
  },
  {
    title: "Bulk & business shipments",
    description: "Multi-item and palletized loads for shops, wholesalers, and offices.",
    weight: "light" as const,
  },
  {
    title: "Heavy-duty equipment transport",
    description: "Generators, industrial machinery, and construction equipment, matched to the right vehicle.",
    weight: "bold" as const,
  },
  {
    title: "Oversized cargo",
    description: "Long, wide, or awkward loads planned with route and clearance in mind.",
    weight: "bold" as const,
  },
  {
    title: "Intercity & long-distance",
    description: "Scheduled and on-demand transport between regions.",
    weight: "light" as const,
  },
  {
    title: "Special handling",
    description: "Fragile, temperature-sensitive, or high-value cargo with extra care.",
    weight: "light" as const,
  },
];

export default function ServicesPage() {
  return (
    <Container className="py-20">
      <SectionHeading
        title="Services"
        description="One platform covering the full range of what needs to move — from a single envelope to a piece of heavy machinery."
      />

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.title} weight={service.weight}>
            <h3 className="font-display text-lg font-semibold">{service.title}</h3>
            <p
              className={`mt-2 text-sm leading-relaxed ${
                service.weight === "bold" ? "text-paper/80" : "text-ink-muted"
              }`}
            >
              {service.description}
            </p>
          </Card>
        ))}
      </div>
    </Container>
  );
}
