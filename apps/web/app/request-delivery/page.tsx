import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Label, Input, Select, Textarea } from "@/components/Field";
import { Button } from "@/components/Button";

export default function RequestDeliveryPage() {
  return (
    <Container className="py-20">
      <SectionHeading
        title="Request a delivery"
        description="Tell us what you're shipping and where. We'll follow up with a quote."
      />

      <form className="mt-10 max-w-xl space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="pickup">Pickup location</Label>
            <Input id="pickup" name="pickup" type="text" placeholder="Kumasi, Ashanti" />
          </div>
          <div>
            <Label htmlFor="destination">Destination</Label>
            <Input id="destination" name="destination" type="text" placeholder="Accra, Greater Accra" />
          </div>
        </div>

        <div>
          <Label htmlFor="cargoType">Cargo type</Label>
          <Select id="cargoType" name="cargoType" defaultValue="">
            <option value="" disabled>
              Select a cargo type
            </option>
            <option value="standard">Standard package</option>
            <option value="bulk">Bulk goods</option>
            <option value="heavy">Heavy-duty equipment</option>
            <option value="oversized">Oversized cargo</option>
            <option value="business">Business shipment</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="notes">Cargo description</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Describe the size, weight, and any special handling needed"
          />
        </div>

        <Button type="submit" disabled>
          Get a quote
        </Button>
        <p className="text-xs text-ink-faint">
          The quoting engine isn&apos;t implemented yet — this is a foundation-stage placeholder.
        </p>
      </form>
    </Container>
  );
}
