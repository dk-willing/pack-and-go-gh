"use client";

import Link from "next/link";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  customerApi,
  deliveryRequestApi,
  notificationApi,
  type CustomerProfile,
  type CustomerNotification,
  type DeliveryRequest,
} from "@/lib/apiClient";

export default function DashboardPage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [error, setError] = useState("");
  const [isDeciding, setIsDeciding] = useState(false);
  const [copiedTrackingNumber, setCopiedTrackingNumber] = useState<
    string | null
  >(null);
  const [notifications, setNotifications] = useState<CustomerNotification[]>(
    [],
  );
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    Promise.all([
      customerApi.getProfile(),
      deliveryRequestApi.list(),
      notificationApi.list(),
    ])
      .then(([profileResult, requestResult, notificationResult]) => {
        setProfile(profileResult);
        setRequests(requestResult.requests);
        setNotifications(notificationResult.notifications);
        setUnreadCount(notificationResult.unreadCount);
      })
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Unable to load your dashboard.",
        ),
      );
  }, []);
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
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to process quote decision.",
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
  const markNotificationRead = async (notification: CustomerNotification) => {
    if (notification.readAt) return;
    try {
      const result = await notificationApi.markRead(notification._id);
      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id ? result.notification : item,
        ),
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch {
      setError("Unable to update notification.");
    }
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
        {error && (
          <p
            role="alert"
            className="mt-8 border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        <section className="mt-10 rounded-2xl border border-navy-950/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Notifications</h2>
              <p className="mt-1 text-sm text-ink-muted">
                {unreadCount > 0
                  ? `${unreadCount} unread shipment update${unreadCount === 1 ? "" : "s"}`
                  : "You are up to date."}
              </p>
            </div>
            <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-route px-2 text-sm font-semibold text-navy-950">
              {unreadCount}
            </span>
          </div>
          <div className="mt-5 divide-y divide-navy-950/10">
            {notifications.length === 0 ? (
              <p className="py-4 text-sm text-ink-muted">
                No shipment notifications yet.
              </p>
            ) : (
              notifications.map((notification) => (
                <button
                  type="button"
                  key={notification._id}
                  onClick={() => void markNotificationRead(notification)}
                  className={`block w-full py-4 text-left ${notification.readAt ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{notification.title}</p>
                      <p className="mt-1 text-sm text-ink-muted">
                        {notification.message}
                      </p>
                    </div>
                    <time className="shrink-0 text-xs text-ink-faint">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
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
          <div className="rounded-2xl border border-navy-950/10 bg-white p-6">
            <p className="text-sm text-ink-muted">Account role</p>
            <p className="mt-2 text-xl font-semibold">
              {profile?.user.role ?? "..."}
            </p>
          </div>
        </div>
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Recent delivery requests</h2>
            <Link
              className="text-sm font-medium underline underline-offset-4"
              href="/request-delivery"
            >
              Create request
            </Link>
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
