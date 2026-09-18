"use client";

import { useState } from "react";
import { Modal } from "./Modal";

type LegalDocument = "privacy" | "terms" | "shipping";

const documents: Record<
  LegalDocument,
  {
    title: string;
    introduction: string;
    sections: { title: string; paragraphs: string[] }[];
  }
> = {
  privacy: {
    title: "Privacy policy",
    introduction:
      "This policy explains how Pack & Go - GH collects, uses, and protects information when you use our website, account, and delivery services.",
    sections: [
      {
        title: "Information we collect",
        paragraphs: [
          "We collect the information needed to provide delivery services, including your name, contact details, pickup and destination addresses, shipment details, saved locations, and account activity.",
          "When you contact us, we may also keep your message and any information you choose to provide so we can respond and improve our service.",
        ],
      },
      {
        title: "How we use your information",
        paragraphs: [
          "We use your information to create and manage delivery requests, provide quotes, coordinate drivers and vehicles, send shipment updates, process support requests, and protect the security of our platform.",
          "We may use aggregated, non-identifying information to understand service demand and improve routes, products, and customer experience.",
        ],
      },
      {
        title: "Sharing information",
        paragraphs: [
          "We share only the information needed to complete a delivery with drivers, transport partners, and service providers working on our behalf. We may also disclose information when required by law, to protect our rights, or to prevent fraud and misuse.",
          "We do not sell your personal information.",
        ],
      },
      {
        title: "Security and retention",
        paragraphs: [
          "We use reasonable administrative, technical, and operational safeguards to protect information. No online service can guarantee absolute security, so please choose a strong password and keep your login details private.",
          "We retain information for as long as reasonably needed to provide services, meet legal and accounting obligations, resolve disputes, and enforce our agreements.",
        ],
      },
      {
        title: "Your choices",
        paragraphs: [
          "You may review and update your profile information through your account. You may also contact us to ask about access, correction, or deletion of personal information, subject to applicable legal and operational requirements.",
          "You can opt out of non-essential marketing messages. Service messages about an active delivery or account may still be sent.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms of service",
    introduction:
      "These terms explain the rules for using Pack & Go - GH and the responsibilities that apply when you request or receive a delivery.",
    sections: [
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
    ],
  },
  shipping: {
    title: "Shipping and cancellation policy",
    introduction:
      "This policy explains how Pack & Go - GH handles shipment preparation, timing, cancellations, failed deliveries, and claims.",
    sections: [
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
          "After vehicle assignment, pickup, or commencement of transport, cancellation charges may apply for work completed, reserved capacity, permits, waiting time, storage, or other non-refundable costs.",
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
    ],
  },
};

export function LegalModal() {
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const activeDocument = document ? documents[document] : null;

  return (
    <>
      <div className="flex flex-col items-start gap-1 text-sm">
        <button
          type="button"
          onClick={() => setDocument("privacy")}
          className="rounded px-2 py-1.5 text-left text-paper/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          Privacy policy
        </button>
        <button
          type="button"
          onClick={() => setDocument("terms")}
          className="rounded px-2 py-1.5 text-left text-paper/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          Terms of service
        </button>
        <button
          type="button"
          onClick={() => setDocument("shipping")}
          className="rounded px-2 py-1.5 text-left text-paper/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          Shipping &amp; cancellation
        </button>
      </div>
      <Modal
        open={activeDocument !== null}
        onClose={() => setDocument(null)}
        title={activeDocument?.title ?? "Legal policy"}
      >
        {activeDocument && (
          <div className="text-sm leading-7 text-ink-muted">
            <p>{activeDocument.introduction}</p>
            <p className="mt-3 text-xs text-ink-faint">
              Last updated: September 18, 2026
            </p>
            <div className="mt-8 space-y-7">
              {activeDocument.sections.map((section) => (
                <section key={section.title}>
                  <h4 className="text-lg font-semibold text-navy-950">
                    {section.title}
                  </h4>
                  <div className="mt-2 space-y-2">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
