"use client";

import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { RouteStepper } from "@/components/RouteStepper";
import { Button } from "@/components/Button";

const lifecycleStages = [
  {
    step: "01",
    title: "Request",
    subtitle: "Instant Details Submission",
    description:
      "Tell us your pickup, destination, cargo type, and special handling instructions through our simple booking portal.",
    details: [
      "24/7 Automated route estimation",
      "Flexible cargo weight classifications",
      "Instant address verification",
    ],
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Quote",
    subtitle: "Transparent Pricing Model",
    description:
      "We price the job upfront based on precise vehicle selection, tonnage, transit distance, and optional Goods-in-Transit insurance.",
    details: [
      "Zero hidden transit or fuel fees",
      "Custom enterprise rates for bulk loads",
      "Includes basic GIT insurance",
    ],
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Booking",
    subtitle: "Driver & Route Confirmation",
    description:
      "Accept the transparent quote, select your preferred pickup time window, and lock in your verified fleet vehicle.",
    details: [
      "Dedicated professional dispatch",
      "Scheduled or same-day pickups",
      "Instant digital booking receipt",
    ],
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    step: "04",
    title: "In Transit",
    subtitle: "Live GPS & Milestone Tracking",
    description:
      "Your shipment is assigned to a background-checked driver and monitored live via satellite GPS until arrival.",
    details: [
      "Real-time driver location updates",
      "Automated SMS/Email alerts",
      "Direct communication with dispatch",
    ],
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
    ),
  },
  {
    step: "05",
    title: "Delivered",
    subtitle: "Digital Proof of Delivery",
    description:
      "Cargo is safely dropped off, inspected, and signed for. Digital Proof of Delivery (POD) appears in your account instantly.",
    details: [
      "Electronic signature capture",
      "Photo confirmation of cargo",
      "Downloadable tax invoice & POD",
    ],
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];

const featureHighlights = [
  {
    title: "Nationwide Coverage",
    description:
      "Full transit coverage across all 16 regions in Ghana, connecting major hubs and remote destinations.",
  },
  {
    title: "Vetted Fleet & Drivers",
    description:
      "Every haulage vehicle and driver undergoes stringent safety audits and background verification.",
  },
  {
    title: "Goods-In-Transit Insurance",
    description:
      "Rest easy knowing your valuable commercial cargo is backed by fully integrated transit protection.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="bg-slate-50/50 py-16 sm:py-20">
      {/* Header Section */}
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-100/70 px-3 py-1 text-xs font-semibold text-amber-900">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            Seamless Logistics Engine
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            How Pack &amp; Go Works
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            Whether you&apos;re shipping small enterprise parcels or multi-ton
            industrial machinery, our standardized 5-stage workflow guarantees
            precision from pickup to sign-off.
          </p>
        </div>

        {/* Dynamic Route Stepper */}
        <div className="mt-16  border border-slate-200/80 bg-white p-6 shadow-sm sm:p-10">
          <RouteStepper stages={lifecycleStages} />
        </div>

        {/* Detailed Stage Deep-Dive Cards */}
        <div className="mt-20">
          <SectionHeading
            title="Step-by-step breakdown"
            description="Explore every layer of safety, visibility, and automation embedded into our haulage lifecycle."
          />

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {lifecycleStages.map((stage) => (
              <div
                key={stage.step}
                className="group relative flex flex-col justify-between border border-slate-200/80 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                      {stage.icon}
                    </span>
                    <span className="font-display text-2xl font-bold text-slate-300 group-hover:text-amber-500 transition-colors">
                      {stage.step}
                    </span>
                  </div>

                  <h3 className="mt-6 font-display text-xl font-bold text-gray-900">
                    {stage.title}
                  </h3>
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mt-1">
                    {stage.subtitle}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    {stage.description}
                  </p>

                  <ul className="mt-6 space-y-2.5 border-t border-slate-100 pt-6">
                    {stage.details.map((detail) => (
                      <li
                        key={detail}
                        className="flex items-center gap-2 text-xs font-medium text-slate-700"
                      >
                        <svg
                          className="h-4 w-4 shrink-0 text-emerald-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Highlights Grid */}
        <div className="mt-20 bg-slate-900 p-8 text-white sm:p-12 shadow-xl">
          <div className="grid gap-8 md:grid-cols-3">
            {featureHighlights.map((feature) => (
              <div
                key={feature.title}
                className="border-l-2 border-amber-500 pl-6"
              >
                <h3 className="font-display text-lg font-bold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button href="/request-delivery">Start a delivery request</Button>
            <Button href="/track" variant="secondary">
              Track an existing shipment
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
