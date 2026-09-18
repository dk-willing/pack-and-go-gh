import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/Button";

export const metadata: Metadata = {
  title: "Delivery Solutions in Ghana",
  description:
    "Explore Pack & Go - GH delivery solutions in Ghana for parcels, business freight, heavy equipment, and oversized cargo across the country.",
};

const services = [
  {
    title: "Standard package delivery",
    subtitle: "Parcels & E-commerce",
    description:
      "Point-to-point express delivery for lightweight parcels, documents, and small business fulfillment.",
    image: "/assets/shop-1.avif",
    weight: "light" as const,
    badge: "Express",
    features: [
      "End-to-end tracking",
      "Same-day pickup available",
      "Digital POD",
    ],
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
    title: "Student Relocation & Express",
    subtitle: "Campus & Hostels",
    description:
      "Affordable luggage, hostel packing, and campus-to-campus shipping designed for university students.",
    image: "/assets/shop-1.avif",
    weight: "light" as const,
    badge: "Student Discount",
    features: [
      "Hostel room door-to-door",
      "Shared trunk/box rates",
      "Campus break scheduling",
    ],
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
          d="M12 14l9-5-9-5-9 5 9 5z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
        />
      </svg>
    ),
  },
  {
    title: "Heavy-duty equipment transport",
    subtitle: "Machinery & Mining",
    description:
      "Generators, industrial machinery, and construction tools safely matched to heavy transit trucks.",
    image: "/assets/truck-2.avif",
    weight: "bold" as const,
    badge: "Heavy Haul",
    features: [
      "Rigging & securing",
      "Flatbed & lowbed options",
      "Tonnage specialists",
    ],
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
    subtitle: "Wide & High Tonnage Loads",
    description:
      "Complex, non-standard freight executed with dedicated route surveys, road clearances, and escorts.",
    image: "/assets/truck-1.avif",
    weight: "bold" as const,
    badge: "Specialized",
    features: [
      "Route clearance surveys",
      "Police & safety escorts",
      "Specialized permits",
    ],
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
  {
    title: "Bulk & business shipments",
    subtitle: "Wholesale & Pallets",
    description:
      "Multi-item palletized freight and inventory distribution tailored for retailers, shops, and warehouses.",
    image: "/assets/warehouse.avif",
    weight: "light" as const,
    badge: "Commercial",
    features: [
      "Palletized inventory",
      "Scheduled restocking",
      "Bulk freight rates",
    ],
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
  // {
  //   title: "Intercity & long-distance",
  //   subtitle: "Cross-Regional Freight",
  //   description:
  //     "Scheduled and on-demand regional transit connecting major commercial hubs and remote sites across Ghana.",
  //   image: "/assets/warehouse.avif",
  //   weight: "light" as const,
  //   badge: "Regional",
  //   features: [
  //     "16-Region coverage",
  //     "Scheduled transit lines",
  //     "Intercity GPS tracking",
  //   ],
  //   icon: (
  //     <svg
  //       className="h-5 w-5"
  //       fill="none"
  //       viewBox="0 0 24 24"
  //       stroke="currentColor"
  //     >
  //       <path
  //         strokeLinecap="round"
  //         strokeLinejoin="round"
  //         strokeWidth="2"
  //         d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
  //       />
  //     </svg>
  //   ),
  // },
  {
    title: "Special handling",
    subtitle: "High-Value & Sensitive",
    description:
      "Temperature-sensitive, delicate, or high-value freight managed with customized safety protocols.",
    image: "/assets/shop-1.avif",
    weight: "light" as const,
    badge: "Secure",
    features: [
      "Temperature control",
      "High-value insurance",
      "Dedicated security",
    ],
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
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
  },
];

export default function ServicesPage() {
  return (
    <div className="bg-slate-50/50 py-16 sm:py-20">
      <Container>
        {/* Header Section */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            End-to-End Haulage Capabilities
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Logistics Solutions Built for Every Scale
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            One platform covering the full spectrum of cargo movement — from
            student hostel moves and express parcels to multi-ton heavy
            machinery.
          </p>
        </div>

        {/* Services Grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const isBold = service.weight === "bold";
            return (
              <div
                key={service.title}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
                  isBold
                    ? "bg-slate-900 border-slate-800 text-white shadow-md"
                    : "bg-white border-slate-200/80 text-gray-900 shadow-sm"
                }`}
              >
                <div>
                  {/* Card Image Banner */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover opacity-85 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/20">
                        {service.badge}
                      </span>
                    </div>

                    {/* Icon floating */}
                    <div className="absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md border border-white/30">
                      {service.icon}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-500">
                      {service.subtitle}
                    </p>

                    {/* Dynamic Title Color: Forced to white on 'bold' cards */}
                    <h3
                      className={`mt-1 font-display text-xl font-bold ${isBold ? "text-white" : "text-gray-900"}`}
                    >
                      {service.title}
                    </h3>

                    <p
                      className={`mt-3 text-xs leading-relaxed ${
                        isBold ? "text-slate-300" : "text-gray-600"
                      }`}
                    >
                      {service.description}
                    </p>

                    {/* Feature Checklist */}
                    <ul className="mt-6 space-y-2 border-t border-slate-100/10 pt-4">
                      {service.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-xs font-medium"
                        >
                          <svg
                            className={`h-4 w-4 shrink-0 ${isBold ? "text-amber-400" : "text-emerald-500"}`}
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
                          <span
                            className={
                              isBold ? "text-slate-200" : "text-slate-700"
                            }
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action Link */}
                <div className="px-6 pb-6 pt-2">
                  <a
                    href="/request-delivery"
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-colors ${
                      isBold
                        ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                        : "bg-slate-100 text-slate-900 hover:bg-amber-500 hover:text-white"
                    }`}
                  >
                    <span>Request Quote</span>
                    <svg
                      className="h-4 w-4"
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
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-20 rounded-3xl bg-slate-900 px-8 py-12 text-center text-white sm:px-12 shadow-xl">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Not sure which category fits your cargo?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-slate-300">
            Our dispatch specialists will analyze your dimensions and tonnage to
            assign the safest vehicle and route.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button href="/request-delivery">Request a custom quote</Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
