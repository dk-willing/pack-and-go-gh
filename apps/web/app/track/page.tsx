"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Label, Input } from "@/components/Field";
import { Button } from "@/components/Button";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ApiRequestError, deliveryRequestApi } from "@/lib/apiClient";
import { UserRole } from "@pack-and-go/types";

const customerRoles = [UserRole.CUSTOMER, UserRole.BUSINESS_CUSTOMER];

// Shape used by the existing tracking presentation after real API data is mapped.
const MOCK_SHIPMENT = {
  trackingId: "PG-882940",
  status: "In Transit",
  estimatedDelivery: "Today by 4:30 PM",
  origin: "Accra Central Depot",
  destination: "Kumasi Central Market",
  cargoType: "Retail Goods (2.5 Tons)",
  driver: {
    name: "Kofi Mensah",
    phone: "+233 24 123 4567",
    vehicle: "DAF 10-Ton Flatbed (GT-4021-22)",
    rating: "4.9 ★",
  },
  timeline: [
    {
      status: "Delivered",
      location: "Kumasi Central Market",
      timestamp: "Pending",
      completed: false,
    },
    {
      status: "In Transit on Highway",
      location: "Nsawam-Ejisu Route",
      timestamp: "Sept 17, 02:15 PM",
      completed: true,
      current: true,
    },
    {
      status: "Departed Origin Depot",
      location: "Accra Central Hub",
      timestamp: "Sept 17, 09:30 AM",
      completed: true,
    },
    {
      status: "Cargo Loaded & Inspected",
      location: "Accra Central Hub",
      timestamp: "Sept 17, 08:10 AM",
      completed: true,
    },
    {
      status: "Booking Confirmed",
      location: "Pack & Go Portal",
      timestamp: "Sept 16, 04:45 PM",
      completed: true,
    },
  ],
};

export default function TrackPage() {
  const [query, setQuery] = useState("");
  const [activeShipment, setActiveShipment] = useState<
    typeof MOCK_SHIPMENT | null
  >(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const trackingNumber = new URLSearchParams(window.location.search).get(
      "trackingNumber",
    );
    if (trackingNumber) setQuery(trackingNumber);
  }, []);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setError("");
    if (!query.trim()) {
      setActiveShipment(null);
      return;
    }
    try {
      const result = await deliveryRequestApi.track(query.trim());
      const request = result.request;
      const timeline = [
        {
          status: "Request submitted",
          location: `${request.pickup.city}`,
          timestamp: request.createdAt,
          completed: true,
          current: ["SUBMITTED", "UNDER_REVIEW", "QUOTE_PENDING"].includes(
            request.status,
          ),
        },
        {
          status: "Quote accepted",
          location: "Pack & Go Portal",
          timestamp: request.quote?.decisionAt ?? "Pending",
          completed: [
            "ACCEPTED",
            "PROCESSING",
            "DISPATCHED",
            "ARRIVED",
            "RECEIVED",
          ].includes(request.status),
          current: request.status === "ACCEPTED",
        },
        {
          status: "Processing",
          location: request.destination.city,
          timestamp: [
            "PROCESSING",
            "DISPATCHED",
            "ARRIVED",
            "RECEIVED",
          ].includes(request.status)
            ? request.updatedAt
            : "Pending",
          completed: [
            "PROCESSING",
            "DISPATCHED",
            "ARRIVED",
            "RECEIVED",
          ].includes(request.status),
          current: request.status === "PROCESSING",
        },
        {
          status: "Dispatched",
          location: `${request.pickup.city} to ${request.destination.city}`,
          timestamp: request.dispatchedAt ?? "Pending",
          completed: ["DISPATCHED", "ARRIVED", "RECEIVED"].includes(
            request.status,
          ),
          current: request.status === "DISPATCHED",
        },
        {
          status: "Arrived at destination",
          location: request.destination.city,
          timestamp: ["ARRIVED", "RECEIVED"].includes(request.status)
            ? request.updatedAt
            : "Pending",
          completed: ["ARRIVED", "RECEIVED"].includes(request.status),
          current: request.status === "ARRIVED",
        },
        {
          status: "Received by customer",
          location: request.destination.city,
          timestamp:
            request.status === "RECEIVED" ? request.updatedAt : "Pending",
          completed: request.status === "RECEIVED",
          current: request.status === "RECEIVED",
        },
      ];
      setActiveShipment({
        trackingId: request.trackingNumber ?? query.trim(),
        status: request.status,
        estimatedDelivery: request.estimatedDeliveryDate
          ? new Date(request.estimatedDeliveryDate).toLocaleDateString()
          : "Not scheduled",
        origin: `${request.pickup.city}, ${request.pickup.region}`,
        destination: `${request.destination.city}, ${request.destination.region}`,
        cargoType: request.cargo
          .map((item) => `${item.description} (${item.quantity})`)
          .join(", "),
        driver: request.rider
          ? {
              name: request.rider.name,
              phone: request.rider.phone,
              vehicle: `${request.rider.vehicle} (${request.rider.registrationNumber})`,
              rating: "Assigned rider",
            }
          : {
              name: "Not assigned",
              phone: "Not available",
              vehicle: "Not assigned",
              rating: "Pending",
            },
        timeline,
      });
    } catch (reason) {
      setActiveShipment(null);
      setError(
        reason instanceof ApiRequestError
          ? reason.message
          : "Unable to retrieve tracking information.",
      );
    }
  };

  return (
    <ProtectedRoute roles={customerRoles}>
      <div className="bg-slate-50/50 py-16 sm:py-20">
        <Container>
          {/* Header Section */}
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
              Real-Time Route GPS
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Track Your Shipment
            </h1>
            <p className="mt-3 text-base text-gray-600">
              Enter the tracking number provided by Pack &amp; Go to view live
              shipment details.
            </p>
          </div>

          {/* Search Bar Form */}
          <form onSubmit={handleTrack} className="mx-auto mt-8 max-w-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end rounded-2xl bg-white p-3 shadow-md border border-slate-200">
              <div className="flex-1 px-2">
                <Label
                  htmlFor="trackingNumber"
                  className="text-xs font-semibold text-slate-500 uppercase"
                >
                  Tracking Number
                </Label>
                <Input
                  id="trackingNumber"
                  name="trackingNumber"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter PG-000000"
                  className="mt-1 border-none bg-transparent text-base focus:ring-0 px-0"
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto shrink-0">
                Track Shipment
              </Button>
            </div>
          </form>

          {error && (
            <p
              role="alert"
              className="mx-auto mt-4 max-w-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {/* Active Tracking Results Display */}
          {activeShipment && (
            <div className="mx-auto mt-12 max-w-4xl space-y-8">
              {/* Status Summary Banner */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-2xl font-bold text-gray-900">
                        {activeShipment.trackingId}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-800">
                        {activeShipment.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Cargo:{" "}
                      <span className="font-medium text-slate-800">
                        {activeShipment.cargoType}
                      </span>
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Estimated Delivery
                    </p>
                    <p className="font-display text-lg font-bold text-amber-600">
                      {activeShipment.estimatedDelivery}
                    </p>
                  </div>
                </div>

                {/* Route Summary */}
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">
                      Origin
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {activeShipment.origin}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">
                      Destination
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {activeShipment.destination}
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid Breakdown: Driver Info + Timeline */}
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Assigned Driver Card */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
                      Assigned Fleet Driver
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 font-bold text-white font-display">
                        KM
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-gray-900">
                          {activeShipment.driver.name}
                        </h3>
                        <p className="text-xs text-amber-500 font-semibold">
                          {activeShipment.driver.rating}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3 text-xs text-slate-600 border-t border-slate-100 pt-4">
                      <div>
                        <span className="block text-slate-400 font-medium">
                          Vehicle Unit:
                        </span>
                        <span className="font-semibold text-slate-800">
                          {activeShipment.driver.vehicle}
                        </span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-medium">
                          Dispatch Phone:
                        </span>
                        <span className="font-semibold text-slate-800">
                          {activeShipment.driver.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <a
                      href={`tel:${activeShipment.driver.phone}`}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-900 hover:bg-slate-200 transition-colors"
                    >
                      Call Dispatcher
                    </a>
                  </div>
                </div>

                {/* Live Timeline Component */}
                <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
                  <h3 className="font-display text-lg font-bold text-gray-900 mb-6">
                    Milestone Progress
                  </h3>

                  <div className="relative space-y-6 pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {activeShipment.timeline.map((event, idx) => (
                      <div
                        key={idx}
                        className="relative flex items-start gap-4"
                      >
                        {/* Timeline Dot Indicator */}
                        <span
                          className={`absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-white ${
                            event.current
                              ? "border-amber-500 ring-4 ring-amber-100"
                              : event.completed
                                ? "border-emerald-500 bg-emerald-500"
                                : "border-slate-300"
                          }`}
                        />

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-sm font-bold ${
                                event.current
                                  ? "text-amber-600"
                                  : event.completed
                                    ? "text-gray-900"
                                    : "text-slate-400"
                              }`}
                            >
                              {event.status}
                            </p>
                            <span className="text-xs text-slate-400">
                              {event.timestamp}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {event.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State when no query is submitted */}
          {hasSearched && !activeShipment && (
            <div className="mx-auto mt-12 max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <svg
                className="mx-auto h-12 w-12 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M21 21l-6-6m2-5a7 7m-14 0a7 7 0 1114 0a7 7 0 01-14 0z"
                />
              </svg>
              <h3 className="mt-4 font-display text-lg font-bold text-gray-900">
                No shipment found
              </h3>
              <p className="mt-2 text-xs text-gray-500">
                Please double check your tracking number format (e.g.{" "}
                <code className="text-amber-600">PG-882940</code>) and try
                again.
              </p>
            </div>
          )}
        </Container>
      </div>
    </ProtectedRoute>
  );
}
