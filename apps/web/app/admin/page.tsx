"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useToast } from "@/components/ToastProvider";
import {
  ApiRequestError,
  deliveryRequestApi,
  type AdminDeliveryRequest,
  type DeliveryStatus,
} from "@/lib/apiClient";
import { UserRole } from "@pack-and-go/types";

const statuses: DeliveryStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "QUOTE_PENDING",
  "QUOTED",
  "ACCEPTED",
  "PROCESSING",
  "DISPATCHED",
  "ARRIVED",
  "RECEIVED",
  "DECLINED",
  "REJECTED",
  "CANCELLED",
];
const adminRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN];
const nextStatus: Partial<Record<DeliveryStatus, DeliveryStatus>> = {
  SUBMITTED: "UNDER_REVIEW",
  UNDER_REVIEW: "QUOTE_PENDING",
  QUOTE_PENDING: "QUOTED",
  QUOTED: "ACCEPTED",
  ACCEPTED: "PROCESSING",
  PROCESSING: "DISPATCHED",
  DISPATCHED: "ARRIVED",
  ARRIVED: "RECEIVED",
};

export default function AdminPage() {
  const [requests, setRequests] = useState<AdminDeliveryRequest[]>([]);
  const [selected, setSelected] = useState<AdminDeliveryRequest | null>(null);
  const [status, setStatus] = useState<DeliveryStatus | "">("");
  const [search, setSearch] = useState("");
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
  const [rider, setRider] = useState({
    name: "",
    phone: "",
    vehicle: "",
    registrationNumber: "",
  });

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await deliveryRequestApi.adminList({
        status: status || undefined,
        search: search || undefined,
      });
      setRequests(result.requests);
      setSelected((current) =>
        current
          ? (result.requests.find((request) => request._id === current._id) ??
            null)
          : null,
      );
    } catch (reason) {
      showToast(
        reason instanceof ApiRequestError
          ? reason.message
          : "Unable to load customer requests.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  }, [search, showToast, status]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const updateStatus = async (nextStatus: DeliveryStatus) => {
    if (!selected) return;
    setIsUpdating(true);
    try {
      const result = await deliveryRequestApi.adminUpdateStatus(
        selected._id,
        nextStatus,
      );
      setSelected(result.request);
      await loadRequests();
    } catch (reason) {
      showToast(
        reason instanceof ApiRequestError
          ? reason.message
          : "Unable to update request status.",
        "error",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const createQuote = async () => {
    if (!selected || !quoteAmount) return;
    setIsUpdating(true);
    try {
      const result = await deliveryRequestApi.adminQuote(selected._id, {
        amount: Number(quoteAmount),
        notes: quoteNotes || undefined,
      });
      setSelected(result.request);
      await loadRequests();
    } catch (reason) {
      showToast(
        reason instanceof ApiRequestError
          ? reason.message
          : "Unable to create quote.",
        "error",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const processShipment = async () => {
    if (
      !selected ||
      !estimatedDeliveryDate ||
      !rider.name ||
      !rider.phone ||
      !rider.vehicle ||
      !rider.registrationNumber
    )
      return;
    setIsUpdating(true);
    try {
      const result = await deliveryRequestApi.adminProcess(selected._id, {
        estimatedDeliveryDate,
        rider,
      });
      setSelected(result.request);
      await loadRequests();
    } catch (reason) {
      showToast(
        reason instanceof ApiRequestError
          ? reason.message
          : "Unable to process shipment.",
        "error",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const dispatchShipment = async () => {
    if (!selected) return;
    setIsUpdating(true);
    try {
      const result = await deliveryRequestApi.adminDispatch(selected._id);
      setSelected(result.request);
      await loadRequests();
    } catch (reason) {
      showToast(
        reason instanceof ApiRequestError
          ? reason.message
          : "Unable to dispatch shipment.",
        "error",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ProtectedRoute roles={adminRoles}>
      <Container className="py-14 sm:py-20">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-route">
              Admin workspace
            </p>
            <h1 className="mt-3 text-4xl font-semibold">Customer requests</h1>
            <p className="mt-2 text-ink-muted">
              Review incoming requests and move them through the operational
              workflow.
            </p>
          </div>
        </div>
        <form
          className="mt-8 flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            void loadRequests();
          }}
        >
          <input
            aria-label="Search request number"
            placeholder="Search request number"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="rounded-sm border border-navy-950/15 bg-white px-4 py-2.5 text-sm"
          />
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as DeliveryStatus | "")
            }
            className="rounded-sm border border-navy-950/15 bg-white px-4 py-2.5 text-sm"
          >
            <option value="">All statuses</option>
            {statuses.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <Button type="submit">Search</Button>
        </form>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <section className="overflow-hidden rounded-2xl border border-navy-950/10 bg-white">
            {isLoading ? (
              <p className="p-6 text-sm text-ink-muted">Loading requests...</p>
            ) : requests.length === 0 ? (
              <p className="p-6 text-sm text-ink-muted">
                No matching requests.
              </p>
            ) : (
              requests.map((request) => (
                <button
                  type="button"
                  key={request._id}
                  onClick={() => setSelected(request)}
                  className={`block w-full border-b border-navy-950/10 p-5 text-left last:border-0 hover:bg-paper ${selected?._id === request._id ? "bg-paper" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{request.requestNumber}</p>
                      <p className="mt-1 text-sm text-ink-muted">
                        {request.pickup.city} to {request.destination.city}
                      </p>
                      <p className="mt-1 text-xs text-ink-faint">
                        {request.customer?.user?.name ?? "Customer"}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                      {request.status}
                    </span>
                  </div>
                </button>
              ))
            )}
          </section>
          <section className="rounded-2xl border border-navy-950/10 bg-white p-6">
            {selected ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-ink-muted">
                      Request
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold">
                      {selected.requestNumber}
                    </h2>
                    <p className="mt-1 text-sm text-ink-muted">
                      Customer: {selected.customer?.user?.name ?? "Unknown"}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                    {selected.status}
                  </span>
                </div>
                <div className="mt-8 grid gap-5 sm:grid-cols-2 text-sm">
                  <div>
                    <p className="font-semibold">Pickup</p>
                    <p className="mt-1 text-ink-muted">
                      {selected.pickup.address}, {selected.pickup.city},{" "}
                      {selected.pickup.region}
                    </p>
                    <p className="mt-1 text-ink-muted">
                      {selected.pickupContact.name} ·{" "}
                      {selected.pickupContact.phone}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Destination</p>
                    <p className="mt-1 text-ink-muted">
                      {selected.destination.address},{" "}
                      {selected.destination.city}, {selected.destination.region}
                    </p>
                    <p className="mt-1 text-ink-muted">
                      {selected.destinationContact.name} ·{" "}
                      {selected.destinationContact.phone}
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="font-semibold">Cargo</p>
                  {selected.cargo.map((item, index) => (
                    <p
                      key={`${item.description}-${index}`}
                      className="mt-1 text-sm text-ink-muted"
                    >
                      {item.category}: {item.description} · quantity{" "}
                      {item.quantity}
                    </p>
                  ))}
                </div>
                {(selected.status === "SUBMITTED" ||
                  selected.status === "UNDER_REVIEW" ||
                  selected.status === "QUOTE_PENDING") && (
                  <div className="mt-8 border-t border-navy-950/10 pt-6">
                    <h3 className="font-semibold">Create quote</h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <input
                        aria-label="Quote amount"
                        type="number"
                        min="0"
                        placeholder="Amount in GHS"
                        value={quoteAmount}
                        onChange={(event) => setQuoteAmount(event.target.value)}
                        className="rounded-sm border border-navy-950/15 px-3 py-2 text-sm"
                      />
                      <input
                        aria-label="Quote notes"
                        placeholder="Quote notes (optional)"
                        value={quoteNotes}
                        onChange={(event) => setQuoteNotes(event.target.value)}
                        className="rounded-sm border border-navy-950/15 px-3 py-2 text-sm"
                      />
                    </div>
                    <Button
                      type="button"
                      className="mt-3"
                      disabled={isUpdating || !quoteAmount}
                      onClick={() => void createQuote()}
                    >
                      Send quote
                    </Button>
                  </div>
                )}
                {selected.status === "ACCEPTED" && (
                  <div className="mt-8 border-t border-navy-950/10 pt-6">
                    <h3 className="font-semibold">Process shipment</h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <input
                        aria-label="Estimated delivery date"
                        type="date"
                        value={estimatedDeliveryDate}
                        onChange={(event) =>
                          setEstimatedDeliveryDate(event.target.value)
                        }
                        className="rounded-sm border border-navy-950/15 px-3 py-2 text-sm"
                      />
                      <input
                        aria-label="Rider name"
                        placeholder="Rider name"
                        value={rider.name}
                        onChange={(event) =>
                          setRider({ ...rider, name: event.target.value })
                        }
                        className="rounded-sm border border-navy-950/15 px-3 py-2 text-sm"
                      />
                      <input
                        aria-label="Rider phone"
                        placeholder="Rider phone"
                        value={rider.phone}
                        onChange={(event) =>
                          setRider({ ...rider, phone: event.target.value })
                        }
                        className="rounded-sm border border-navy-950/15 px-3 py-2 text-sm"
                      />
                      <input
                        aria-label="Vehicle"
                        placeholder="Vehicle"
                        value={rider.vehicle}
                        onChange={(event) =>
                          setRider({ ...rider, vehicle: event.target.value })
                        }
                        className="rounded-sm border border-navy-950/15 px-3 py-2 text-sm"
                      />
                      <input
                        aria-label="Vehicle registration number"
                        placeholder="Registration number"
                        value={rider.registrationNumber}
                        onChange={(event) =>
                          setRider({
                            ...rider,
                            registrationNumber: event.target.value,
                          })
                        }
                        className="rounded-sm border border-navy-950/15 px-3 py-2 text-sm"
                      />
                    </div>
                    <Button
                      type="button"
                      className="mt-3"
                      disabled={isUpdating}
                      onClick={() => void processShipment()}
                    >
                      Start processing
                    </Button>
                  </div>
                )}
                {selected.status === "PROCESSING" && (
                  <div className="mt-8 border-t border-navy-950/10 pt-6">
                    <h3 className="font-semibold">Dispatch shipment</h3>
                    <p className="mt-2 text-sm text-ink-muted">
                      A unique tracking number will be generated automatically.
                    </p>
                    <Button
                      type="button"
                      className="mt-3"
                      disabled={isUpdating}
                      onClick={() => void dispatchShipment()}
                    >
                      Dispatch shipment
                    </Button>
                  </div>
                )}
                <div className="mt-8">
                  <label
                    htmlFor="next-status"
                    className="block text-sm font-medium"
                  >
                    Next logistics step
                  </label>
                  <div className="mt-2 flex gap-3">
                    <select
                      id="next-status"
                      defaultValue=""
                      disabled={isUpdating}
                      onChange={(event) => {
                        if (event.target.value)
                          void updateStatus(
                            event.target.value as DeliveryStatus,
                          );
                      }}
                      className="flex-1 rounded-sm border border-navy-950/15 bg-white px-4 py-2.5 text-sm"
                    >
                      <option value="">
                        {nextStatus[selected.status] ?? "No further step"}
                      </option>
                      {nextStatus[selected.status] && (
                        <option value={nextStatus[selected.status]}>
                          Mark as {nextStatus[selected.status]}
                        </option>
                      )}
                    </select>
                  </div>
                  <p className="mt-2 text-xs text-ink-muted">
                    Requests follow: dispatched, arrived, then received.
                  </p>
                </div>
              </>
            ) : (
              <p className="py-10 text-sm text-ink-muted">
                Select a request to review its details.
              </p>
            )}
          </section>
        </div>
      </Container>
    </ProtectedRoute>
  );
}
