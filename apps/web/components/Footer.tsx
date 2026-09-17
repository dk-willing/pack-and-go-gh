import Link from "next/link";
import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="border-t border-navy-950/10 bg-navy-950 text-paper/80">
      <Container className="py-12 grid gap-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg font-semibold text-paper">
            Pack &amp; Go GH
          </p>
          <p className="mt-3 text-sm leading-relaxed max-w-xs">
            Nationwide transport for everything from a single parcel to
            oversized industrial equipment.
          </p>
        </div>

        <div>
          <p className="text-[17px] font-bold text-paper">Company</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/about" className="text-paper">
                About
              </Link>
            </li>
            <li>
              <Link href="/services" className="text-paper">
                Services
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="text-paper">
                How it works
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-paper">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[17px] font-bold text-paper">Get started</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/request-delivery" className="text-paper">
                Request a delivery
              </Link>
            </li>
            <li>
              <Link href="/track" className="text-paper">
                Track a shipment
              </Link>
            </li>
          </ul>
        </div>
      </Container>

      <Container className="border-t border-paper/10 py-6 text-xs text-paper/60">
        © {new Date().getFullYear()} Pack &amp; Go - GH. All rights reserved.
      </Container>
    </footer>
  );
}
