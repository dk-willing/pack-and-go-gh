import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Label, Input, Textarea } from "@/components/Field";
import { Button } from "@/components/Button";

export default function ContactPage() {
  return (
    <Container className="py-20">
      <SectionHeading
        title="Contact us"
        description="Questions about a shipment, a quote, or working with Pack & Go? Reach out below."
      />

      <form className="mt-10 max-w-lg space-y-5">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" type="text" placeholder="Ama Owusu" />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" />
        </div>

        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" name="message" placeholder="How can we help?" />
        </div>

        <Button type="submit" disabled>
          Send message
        </Button>
        <p className="text-xs text-ink-faint">
          Form submission isn&apos;t wired up yet — this is a foundation-stage placeholder.
        </p>
      </form>
    </Container>
  );
}
