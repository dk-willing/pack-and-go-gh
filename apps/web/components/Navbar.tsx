import Link from "next/link";
import { Container } from "./Container";
import { Button } from "./Button";

const links = [
  { href: "/services", label: "Services" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/track", label: "Track a shipment" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  return (
    <header className="border-b border-navy-950/10 bg-paper/95 backdrop-blur">
      <Container className="flex h-20 items-center justify-between">
        <Link href="/" className="font-display text-xl font-semibold text-navy-950">
          Pack &amp; Go <span className="text-route">GH</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink-muted hover:text-navy-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Button href="/request-delivery" className="hidden sm:inline-flex">
          Request a delivery
        </Button>
      </Container>
    </header>
  );
}
