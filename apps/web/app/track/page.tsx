import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Label, Input } from "@/components/Field";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/States";

export default function TrackPage() {
  return (
    <Container className="py-20">
      <SectionHeading
        title="Track a shipment"
        description="Enter your tracking number to see the latest status."
      />

      <form className="mt-10 flex max-w-lg flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label htmlFor="trackingNumber">Tracking number</Label>
          <Input id="trackingNumber" name="trackingNumber" type="text" placeholder="PG-000000" />
        </div>
        <Button type="submit" disabled>
          Track
        </Button>
      </form>

      <div className="mt-10 max-w-lg">
        <EmptyState
          title="Tracking isn't live yet"
          description="This page is a foundation-stage placeholder — shipment tracking will appear here once the tracking feature is implemented."
        />
      </div>
    </Container>
  );
}
