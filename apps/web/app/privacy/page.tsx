import { Container } from "@/components/Container";

const sections = [
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
];

export default function PrivacyPage() {
  return (
    <Container className="py-14 sm:py-20">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-route">
          Legal
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Privacy policy</h1>
        <p className="mt-4 text-sm text-ink-muted">
          Last updated: September 18, 2026
        </p>
        <p className="mt-8 text-lg leading-8 text-ink-muted">
          This policy explains how Pack &amp; Go - GH collects, uses, and
          protects information when you use our website, account, and delivery
          services.
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
        <section className="mt-12 border-t border-navy-950/10 pt-8">
          <h2 className="text-2xl font-semibold">Questions</h2>
          <p className="mt-3 text-sm leading-7 text-ink-muted">
            For privacy questions or requests, please contact Pack &amp; Go
            through the contact details on our Contact page.
          </p>
        </section>
      </div>
    </Container>
  );
}
