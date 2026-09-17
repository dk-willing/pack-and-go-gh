"use client";

import { useState } from "react";
import Image from "next/image";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import Map from "@/components/Map";
import { RouteStepper } from "@/components/RouteStepper";

const cargoCategories = [
  {
    title: "Standard packages",
    subtitle: "Parcels & Small Business",
    description:
      "Documents, direct e-commerce fulfillment, and light goods delivered with end-to-end tracking.",
    image: "/assets/shop-1.avif",
    tag: "Express",
    tagColor: "bg-emerald-500/90 text-white",
    weight: "light" as const,
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  },
  {
    title: "Bulk goods",
    subtitle: "Wholesale & Pallets",
    description:
      "Palletized inventory and multi-ton loads tailored for regional wholesalers and retail chains.",
    image: "/assets/shop-1.avif",
    tag: "Commercial",
    tagColor: "bg-blue-600/90 text-white",
    weight: "light" as const,
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
  },
  {
    title: "Heavy-duty equipment",
    subtitle: "Machinery & Industrial",
    description:
      "Generators, construction tools, and mining equipment moved with heavy transport trucks.",
    image: "/assets/truck-2.avif",
    tag: "Heavy Haul",
    tagColor: "bg-amber-500/90 text-white",
    weight: "bold" as const,
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
  {
    title: "Oversized cargo",
    subtitle: "High-Tonnage & Wide Loads",
    description:
      "Specialized, non-standard freight planned with complete route surveys and police escorts.",
    image: "/assets/truck-1.avif",
    tag: "Specialized",
    tagColor: "bg-rose-600/90 text-white",
    weight: "bold" as const,
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
];

const lifecycleStages = [
  {
    title: "Request",
    description: "Tell us your pickup, destination, and what you're moving.",
  },
  {
    title: "Quote",
    description:
      "We price the job transparently based on cargo size, vehicle requirements, and distance.",
  },
  {
    title: "Booking",
    description: "Accept the quote and confirm your scheduled pickup window.",
  },
  {
    title: "In transit",
    description:
      "Your verified driver is assigned and your shipment is live-tracked on the road.",
  },
  {
    title: "Delivered",
    description:
      "Digital proof of delivery (POD) lands in your portal the moment cargo is signed off.",
  },
];

const platformStats = [
  { value: "16", label: "Regions Covered Across Ghana" },
  { value: "99.4%", label: "On-Time Delivery Rate" },
  { value: "10,000+", label: "Shipments Completed" },
  { value: "24/7", label: "Real-Time GPS Tracking" },
];

const logisticsExperts = [
  {
    name: "Kofi Mensah",
    role: "Fleet Operations Lead",
    image: "/assets/warehouse.avif",
    bio: "Over 12 years managing nationwide heavy transit routes and specialized driver safety compliance.",
  },
  {
    name: "Esi Boateng",
    role: "Senior Freight Dispatcher",
    image: "/assets/employee-1.avif",
    bio: "Specializes in route optimization, express urban deliveries, and cross-border logistics clearance.",
  },
  {
    name: "Kwame Osei",
    role: "Cargo Safety Manager",
    image: "/assets/employee-2.avif",
    bio: "Oversees delicate loading protocols, machinery rigging, and heavy-equipment risk mitigation.",
  },
];

const faqs = [
  {
    question: "What regions in Ghana do you deliver to?",
    answer:
      "We cover all 16 regions across Ghana—including major freight corridors between Accra, Kumasi, Tamale, Takoradi, and Tema, as well as remote last-mile industrial sites.",
  },
  {
    question: "How are shipping prices calculated?",
    answer:
      "Pricing is transparently calculated based on total cargo weight, physical dimensions, the required vehicle type (e.g., flatbed vs. box truck), distance, and special permits or police escorts.",
  },
  {
    question: "How do I track my delivery in real time?",
    answer:
      "Once your shipment is dispatched, you receive a direct tracking link via SMS and email. You can also monitor live driver locations and ETA milestones inside your Pack & Go dashboard.",
  },
  {
    question: "Can Pack & Go handle specialized or oversized equipment?",
    answer:
      "Yes. Our heavy haulage division coordinates road safety permits, route clearance surveys, lowbed trailers, and escort vehicles for oversized industrial, mining, and agricultural gear.",
  },
  {
    question: "Is cargo insurance included with my shipment?",
    answer:
      "Standard Goods-in-Transit (GIT) insurance is included with every quote. Expanded high-value coverage options can also be added for sensitive or high-tonnage cargo.",
  },
];

export default function HomePage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <>
      {/* Hero Section */}
      <section className="border-b border-navy-950/10 bg-white">
        <Container className="grid gap-12 py-12 lg:grid-cols-2 lg:items-center lg:py-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              Ghana&apos;s Trusted Logistics Partner
            </span>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight leading-[1.1] text-gray-900 sm:text-5xl">
              One carrier for everything you need moved across Ghana.
            </h1>
            <p className="mt-6 max-w-prose text-lg leading-relaxed text-ink-muted">
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

      {/* Metrics */}
      <section className="border-b border-navy-950/10 bg-navy-950/5 py-10">
        <Container>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {platformStats.map((stat) => (
              <div key={stat.label} className="text-center md:text-left">
                <p className="font-display text-3xl font-bold text-navy-950">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-medium text-ink-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Beautiful Cargo Categories Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <Container>
          <SectionHeading
            title="Built for the full range of cargo"
            description="Whichever category your shipment falls into, it moves through the same reliable process."
          />

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {cargoCategories.map((category) => (
              <div
                key={category.title}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-xl"
              >
                {/* Image Container with Gradient Overlay */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-900">
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    className="object-cover opacity-90 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Floating Top Tag */}
                  <div className="absolute top-4 left-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold tracking-wide backdrop-blur-md ${category.tagColor}`}
                    >
                      {category.tag}
                    </span>
                  </div>

                  {/* Icon badge inside image bottom */}
                  <div className="absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md border border-white/30">
                    {category.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
                    {category.subtitle}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-bold text-gray-900">
                    {category.title}
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-gray-600 flex-1">
                    {category.description}
                  </p>

                  <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-gray-900 transition-colors group-hover:text-amber-600">
                    <span>View Specifications</span>
                    <svg
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Delivery Experts */}
      <section className="border-y border-navy-950/10 bg-white py-20">
        <Container>
          <SectionHeading
            title="Backed by logistics experts"
            description="Our team of seasoned dispatchers, fleet managers, and safety specialists coordinate every haul."
          />

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {logisticsExperts.map((expert) => (
              <div
                key={expert.name}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="relative h-40 w-full overflow-hidden rounded-xl bg-gray-100">
                  <Image
                    src={expert.image}
                    alt={expert.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-gray-900">
                  {expert.name}
                </h3>
                <p className="text-xs font-semibold text-amber-600">
                  {expert.role}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-ink-muted">
                  {expert.bio}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Lifecycle Route Stepper */}
      <section className="border-b border-navy-950/10 bg-navy-950/[0.02] py-20">
        <Container>
          <SectionHeading
            title="How a delivery moves through Pack & Go"
            description="Every shipment follows the same five transparent stages, visible in your account the whole way."
          />

          <div className="mt-12">
            <RouteStepper stages={lifecycleStages} />
          </div>
        </Container>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-20 bg-white">
        <Container className="max-w-4xl">
          <SectionHeading
            title="Frequently Asked Questions"
            description="Everything you need to know about booking, fleet selection, and tracking cargo with Pack & Go."
          />

          <div className="mt-12 divide-y divide-gray-200 border-t border-b border-gray-200">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={faq.question} className="py-5">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-display text-base font-semibold text-gray-900">
                      {faq.question}
                    </span>
                    <span className="ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                      <svg
                        className={`h-4 w-4 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </button>

                  {isOpen && (
                    <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50 px-4">
        <Container className=" bg-navy-950 px-8 py-16 text-center sm:px-16">
          <h2 className="font-display text-lg sm:text-3xl font-semibold text-paper">
            Ready to move your next shipment?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-paper/70 text-sm sm:text-lg">
            Tell us what you&apos;re shipping and where it needs to go —
            we&apos;ll handle the rest with total reliability.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button
              href="/request-delivery"
              variant="secondary"
              className="border-paper/30 text-paper hover:border-paper rounded-md"
            >
              Request a delivery
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
