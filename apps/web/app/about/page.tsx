import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Pack & Go - GH, a trusted delivery solutions provider in Ghana for parcels, bulk freight, and specialized cargo transport.",
};

export default function AboutPage() {
  return (
    <Container className="py-20">
      <SectionHeading
        title="About Pack & Go - GH"
        description="A logistics platform built to move anything from a single parcel to oversized industrial equipment, reliably and transparently, across Ghana."
      />

      <div className="mt-10 max-w-prose text-ink-muted leading-relaxed space-y-4">
        <p>
          Pack &amp; Go - GH connects customers who need something moved with
          the vehicles and drivers suited to the job — whether that&apos;s a
          same-day parcel across town or a piece of heavy equipment moving
          between regions.
        </p>
        <p>
          This page is a placeholder for the foundation stage of the platform.
          Company details, team information, and our safety and handling
          standards will be added here as the platform develops.
        </p>
      </div>
    </Container>
  );
}
