"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { Input, Label, Textarea } from "@/components/Field";
import { SectionHeading } from "@/components/SectionHeading";

const SOCIAL_CHANNELS = [
  {
    name: "WhatsApp",
    handle: "+233 (0) 50 000 0000",
    href: "https://wa.me/233500000000",
    badge: "Fastest",
    hoverBg: "hover:border-emerald-300 hover:bg-emerald-50/60",
    iconBg: "bg-emerald-100 text-emerald-600",
    svg: (
      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    handle: "@packandgo.gh",
    href: "https://instagram.com",
    hoverBg: "hover:border-pink-300 hover:bg-pink-50/60",
    iconBg: "bg-pink-100 text-pink-600",
    svg: (
      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    handle: "Pack & Go Logistics",
    href: "https://facebook.com",
    hoverBg: "hover:border-blue-300 hover:bg-blue-50/60",
    iconBg: "bg-blue-100 text-blue-600",
    svg: (
      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    handle: "@packandgo_official",
    href: "https://tiktok.com",
    hoverBg: "hover:border-gray-400 hover:bg-gray-100/60",
    iconBg: "bg-gray-200 text-gray-900",
    svg: (
      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.56-1.31 1.56-1.28 2.55.02.94.51 1.85 1.28 2.38.87.61 2.04.68 2.99.23.82-.38 1.38-1.18 1.51-2.08.08-1.34.03-2.69.03-4.04V.02z" />
      </svg>
    ),
  },
  {
    name: "Snapchat",
    handle: "packandgo_gh",
    href: "https://snapchat.com",
    hoverBg: "hover:border-amber-300 hover:bg-amber-50/60",
    iconBg: "bg-amber-100 text-amber-600",
    svg: (
      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c-3.19 0-5.38 2.222-5.38 5.176 0 .866.236 1.956.711 2.796.115.203.1.28-.052.428-.488.473-.996 1.011-1.378 1.838-.178.388-.007.69.378.795.846.229 1.637.07 2.21-.19.167-.075.281-.035.378.118.423.666 1.545 1.443 3.133 1.443 1.588 0 2.71-.777 3.133-1.443.097-.153.211-.193.378-.118.573.26 1.364.419 2.21.19.385-.105.556-.407.378-.795-.382-.827-.89-1.365-1.378-1.838-.152-.148-.167-.225-.052-.428.475-.84.711-1.93.711-2.796 0-2.954-2.19-5.176-5.38-5.176z" />
      </svg>
    ),
  },
];

export default function ContactPageClient() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        title="Contact Us"
        description="Questions about a shipment, a quote, or working with Pack & Go? Reach out below or connect with us on social media."
      />

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            {submitted ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-900">
                  Message Sent!
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Thank you for reaching out. One of our logistics managers will
                  get back to you shortly.
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-sm"
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Ama Owusu"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+233 24 000 0000"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="How can we help you today?"
                    rows={5}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="space-y-8 lg:col-span-5">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-white shadow-md">
            <h3 className="text-xl font-bold text-paper">
              Kumasi Headquarters
            </h3>

            <ul className="mt-6 space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Graphic Road, South Industrial Area, Accra, Ghana</span>
              </li>

              <li className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 shrink-0 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <a href="tel:+233554391919" className="text-paper">
                  <span>+233 (0) 30 200 0000</span>
                </a>
              </li>

              <li className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 shrink-0 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>support@packandgo.com</span>
              </li>

              <li className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 shrink-0 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Mon – Sat: 8:00 AM – 6:00 PM GMT</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900">
              Connect via Social Media
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Reach out directly through any of our official channels.
            </p>

            <div className="mt-5 space-y-3">
              {SOCIAL_CHANNELS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between rounded-xl border border-gray-100 p-3.5 transition ${social.hoverBg}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${social.iconBg}`}
                    >
                      {social.svg}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {social.name}
                        </span>
                        {social.badge && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                            {social.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{social.handle}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
