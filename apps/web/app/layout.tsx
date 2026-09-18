import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/ToastProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://packandgo-gh.com"),
  title: {
    default: "Pack & Go - GH | Delivery Solutions in Ghana",
    template: "%s | Pack & Go - GH",
  },
  description:
    "Pack & Go - GH provides reliable delivery solutions in Ghana for parcels, bulk shipments, heavy-duty equipment, and oversized cargo across all 16 regions.",
  keywords: [
    "delivery solutions in Ghana",
    "Ghana logistics company",
    "parcel delivery Ghana",
    "bulk freight Ghana",
    "heavy equipment transport Ghana",
    "oversized cargo Ghana",
    "same day delivery Ghana",
    "commercial logistics Ghana",
    "freight forwarding Ghana",
    "shipment tracking Ghana",
  ],
  applicationName: "Pack & Go - GH",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: "Pack & Go - GH | Delivery Solutions in Ghana",
    description:
      "Trusted delivery solutions in Ghana for parcels, commercial freight, and specialized cargo transport from pickup to final delivery.",
    url: "https://packandgo-gh.com",
    siteName: "Pack & Go - GH",
    locale: "en_GH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pack & Go - GH | Delivery Solutions in Ghana",
    description:
      "Reliable parcel, freight, and heavy cargo delivery across Ghana with real-time tracking.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
