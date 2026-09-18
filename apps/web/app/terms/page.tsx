import { Container } from "@/components/Container";

const sections = [
  {
    title: "Using our services",
    paragraphs: [
      "You must provide accurate contact, pickup, destination, cargo, and scheduling information. You are responsible for ensuring that someone authorized is available to hand over and receive the shipment.",
      "You may not use our services to transport illegal, dangerous, prohibited, or falsely declared goods. We may refuse or stop a shipment that creates a safety, legal, or operational risk.",
    ],
  },
  {
    title: "Quotes and bookings",
    paragraphs: [
      "A delivery request is not a confirmed booking until Pack & Go has accepted it and you have accepted the applicable quote or booking terms. Quotes are based on the information provided and may change if cargo, access, distance, timing, or handling requirements change.",
      "Any applicable taxes, permits, escorts, waiting time, storage, extra handling, or access charges will be communicated where reasonably possible.",
    ],
  },
  {
    title: "Customer responsibilities",
    paragraphs: [
      "You must package goods appropriately, disclose relevant cargo characteristics, provide safe access, and obtain any permissions needed for pickup or delivery. You are responsible for losses caused by inaccurate information, inadequate packaging, or failure to meet these responsibilities.",
      "Do not give drivers cash or instructions that contradict the confirmed delivery details without contacting Pack & Go.",
    ],
  },
  {
    title: "Tracking and delivery records",
    paragraphs: [
      "Tracking information, estimated delivery times, and status updates are provided for operational visibility and may change because of traffic, weather, road conditions, customs, safety issues, or other events outside our reasonable control.",
      "Delivery records, including recipient confirmation and proof of delivery, may be used to resolve delivery questions and disputes.",
    ],
  },
  {
    title: "Liability and changes",
    paragraphs: [
      "Our responsibility for loss or damage is subject to the agreed service terms, declared cargo information, applicable law, and any insurance or coverage selected for the shipment. Nothing in these terms limits rights that cannot legally be limited.",
      "We may update these terms as our services change. The current version will be posted on this page, and continued use after an update means you accept the revised terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <Container className="py-14 sm:py-20">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-route">
          Legal
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Terms of service</h1>
        <p className="mt-4 text-sm text-ink-muted">
          Last updated: September 18, 2026
        </p>
        <p className="mt-8 text-lg leading-8 text-ink-muted">
          These terms explain the rules for using Pack &amp; Go - GH and the
          responsibilities that apply when you request or receive a delivery.
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
