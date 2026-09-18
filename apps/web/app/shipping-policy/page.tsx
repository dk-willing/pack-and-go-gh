import { Container } from "@/components/Container";

const sections = [
  {
    title: "Before pickup",
    paragraphs: [
      "Provide complete and accurate pickup, destination, contact, cargo, and access information when requesting a delivery. Pack goods securely and tell us about fragile, hazardous, oversized, high-value, or temperature-sensitive items before a quote is issued.",
      "We may inspect, weigh, measure, or decline cargo when the shipment differs materially from the request or cannot be transported safely and lawfully.",
    ],
  },
  {
    title: "Delivery timing",
    paragraphs: [
      "Pickup and delivery dates are estimates unless Pack & Go has expressly confirmed a guaranteed service. Timing can be affected by traffic, weather, road conditions, vehicle availability, permits, access restrictions, security concerns, and events outside our reasonable control.",
      "We will use reasonable efforts to provide updates when a material delay affects an active shipment.",
    ],
  },
  {
    title: "Cancellations",
    paragraphs: [
      "You may request cancellation through your account or by contacting Pack & Go. A cancellation before vehicle assignment may be completed without a service charge unless third-party costs have already been incurred.",
      "After vehicle assignment, pickup, or commencement of transport, cancellation charges may apply for work completed, reserved capacity, permits, waiting time, storage, or other non-refundable costs. Any applicable charge will be communicated as soon as reasonably possible.",
    ],
  },
  {
    title: "Failed delivery and storage",
    paragraphs: [
      "The recipient must be available and able to receive the shipment at the confirmed destination. If delivery cannot be completed because of an unavailable recipient, inaccurate details, unsafe access, or refusal, additional redelivery, waiting, or storage charges may apply.",
      "We will contact the customer for instructions where reasonably possible. Unclaimed shipments may be returned or handled in accordance with applicable law and the confirmed service terms.",
    ],
  },
  {
    title: "Damage, loss, and claims",
    paragraphs: [
      "Report visible damage, shortage, or incorrect delivery as soon as possible and provide photographs, delivery records, and other supporting information. Claims are reviewed against the shipment details, packaging, proof of delivery, agreed coverage, and applicable law.",
      "Standard coverage and any additional insurance or declared-value option are subject to the limits and exclusions communicated with the quote or booking.",
    ],
  },
];

export default function ShippingPolicyPage() {
  return (
    <Container className="py-14 sm:py-20">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-route">
          Legal
        </p>
        <h1 className="mt-3 text-4xl font-semibold">
          Shipping and cancellation policy
        </h1>
        <p className="mt-4 text-sm text-ink-muted">
          Last updated: September 18, 2026
        </p>
        <p className="mt-8 text-lg leading-8 text-ink-muted">
          This policy explains how Pack &amp; Go - GH handles shipment
          preparation, timing, cancellations, failed deliveries, and claims.
        </p>
        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-semibold">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-ink-muted">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Container>
  );
}
