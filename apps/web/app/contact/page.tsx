import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Pack & Go - GH for delivery solutions in Ghana, parcel quotes, freight booking, and shipment support.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
