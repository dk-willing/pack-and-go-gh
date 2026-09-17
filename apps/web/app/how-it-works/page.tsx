import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { RouteStepper } from "@/components/RouteStepper";
import { Button } from "@/components/Button";

const lifecycleStages = [
  { title: "Request", description: "Tell us your pickup, destination, and what you're moving." },
  { title: "Quote", description: "We price the job based on cargo, distance, and handling." },
  { title: "Booking", description: "Accept the quote and confirm your pickup window." },
  { title: "In transit", description: "Your driver is assigned and your shipment is on the road." },
  { title: "Delivered", description: "Proof of delivery lands in your account the moment it's dropped off." },
];

export default function HowItWorksPage() {
  return (
    <Container className="py-20">
      <SectionHeading
        title="How it works"
        description="Every shipment, regardless of size, follows the same five stages."
      />

      <div className="mt-12">
        <RouteStepper stages={lifecycleStages} />
      </div>

      <div className="mt-14">
        <Button href="/request-delivery">Start a delivery request</Button>
      </div>
    </Container>
  );
}
