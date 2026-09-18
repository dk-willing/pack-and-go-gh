"use client";

import Link from "next/link";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useToast } from "@/components/ToastProvider";
import {
  customerApi,
  deliveryRequestApi,
  type CustomerProfile,
  type DeliveryRequest,
} from "@/lib/apiClient";

export default function DashboardPage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const { showToast } = useToast();
  const [isDeciding, setIsDeciding] = useState(false);
  const [copiedTrackingNumber, setCopiedTrackingNumber] = useState<
    string | null
  >(null);
  useEffect(() => {
    Promise.all([customerApi.getProfile(), deliveryRequestApi.list()])
      .then(([profileResult, requestResult]) => {
        setProfile(profileResult);
        setRequests(requestResult.requests);
      })
      .catch((reason) =>
        showToast(
          reason instanceof Error
            ? reason.message
            : "Unable to load your dashboard.",
          "error",
        ),
      );
  }, [showToast]);
  const decideQuote = async (id: string, accepted: boolean) => {
    setIsDeciding(true);
    try {
      const result = await deliveryRequestApi.decideQuote(id, accepted);
      setRequests((current) =>
        current.map((request) =>
          request._id === id ? result.request : request,
        ),
      );
    } catch (reason) {
      showToast(
        reason instanceof Error
          ? reason.message
          : "Unable to process quote decision.",
        "error",
      );
    } finally {
      setIsDeciding(false);
    }
  };
  const copyTrackingNumber = async (trackingNumber: string) => {
    await navigator.clipboard.writeText(trackingNumber);
    setCopiedTrackingNumber(trackingNumber);
    window.setTimeout(() => setCopiedTrackingNumber(null), 1800);
  };
  return (
    <ProtectedRoute>
      <Container className="py-14 sm:py-20">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-route">
              Customer portal
            </p>
            <h1 className="mt-3 text-4xl font-semibold">
              Your logistics workspace
            </h1>
            <p className="mt-2 text-ink-muted">
              {profile
                ? `Welcome back, ${profile.user.name}.`
                : "Loading your account..."}
            </p>
          </div>
          <Button href="/request-delivery">New delivery request</Button>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-navy-950/10 bg-white p-6">
            <p className="text-sm text-ink-muted">Total requests</p>
            <p className="mt-2 text-3xl font-semibold">{requests.length}</p>
          </div>
          <div className="rounded-2xl border border-navy-950/10 bg-white p-6">
            <p className="text-sm text-ink-muted">Saved locations</p>
            <p className="mt-2 text-3xl font-semibold">
              {profile?.customer.savedLocations.length ?? 0}
            </p>
          </div>
        </div>
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-md md:text-2xl font-semibold">
              Recent delivery requests
            </h2>
          </div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-navy-950/10 bg-white">
            {requests.length === 0 ? (
              <p className="p-8 text-sm text-ink-muted">
                No delivery requests yet.
              </p>
            ) : (
              requests.map((request) => (
                <div
                  key={request._id}
                  className="flex flex-col gap-3 border-b border-navy-950/10 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold">{request.requestNumber}</p>
                    <p className="mt-1 text-sm text-ink-muted">
                      {request.pickup.city} to {request.destination.city} ·{" "}
                      {request.cargo[0]?.category}
                    </p>
                    {request.trackingNumber && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          Tracking
                        </span>
                        <code className="rounded bg-paper px-2 py-1 text-sm font-semibold text-navy-950">
                          {request.trackingNumber}
                        </code>
                        <button
                          type="button"
                          onClick={() =>
                            void copyTrackingNumber(request.trackingNumber!)
                          }
                          aria-label={`Copy tracking number ${request.trackingNumber}`}
                          title="Copy tracking number"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-navy-950 hover:bg-navy-950/10"
                        >
                          {copiedTrackingNumber === request.trackingNumber ? (
                            <Check
                              aria-hidden="true"
                              className="h-4 w-4 text-emerald-600"
                            />
                          ) : (
                            <Copy aria-hidden="true" className="h-4 w-4" />
                          )}
                        </button>
                        <Link
                          href={`/track?trackingNumber=${encodeURIComponent(request.trackingNumber)}`}
                          title="Track shipment"
                          aria-label={`Track shipment ${request.trackingNumber}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-navy-950 hover:bg-navy-950/10"
                        >
                          <ExternalLink
                            aria-hidden="true"
                            className="h-4 w-4"
                          />
                        </Link>
                      </div>
                    )}
                  </div>
                  <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                    {request.status}
                  </span>
                  {request.status === "QUOTED" && request.quote && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {request.quote.currency}{" "}
                        {request.quote.amount.toFixed(2)}
                      </span>
                      <Button
                        type="button"
                        disabled={isDeciding}
                        onClick={() => void decideQuote(request._id, true)}
                      >
                        Accept
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={isDeciding}
                        onClick={() => void decideQuote(request._id, false)}
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </Container>
    </ProtectedRoute>
  );
}
