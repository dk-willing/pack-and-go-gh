export const QUOTE_STATUSES = [
  "DRAFT",
  "PENDING_APPROVAL",
  "SENT",
  "VIEWED",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
  "CANCELLED",
] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const QUOTE_STATUS_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  DRAFT: ["PENDING_APPROVAL", "SENT"],
  PENDING_APPROVAL: ["SENT", "CANCELLED"],
  SENT: ["VIEWED", "ACCEPTED", "REJECTED", "EXPIRED", "CANCELLED"],
  VIEWED: ["ACCEPTED", "REJECTED", "EXPIRED", "CANCELLED"],
  ACCEPTED: [],
  REJECTED: [],
  EXPIRED: [],
  CANCELLED: [],
};

export function canTransitionQuoteStatus(
  currentStatus: QuoteStatus,
  nextStatus: QuoteStatus,
): boolean {
  return QUOTE_STATUS_TRANSITIONS[currentStatus]?.includes(nextStatus) ?? false;
}

export function isQuoteEditable(status: QuoteStatus): boolean {
  return ["DRAFT", "PENDING_APPROVAL"].includes(status);
}

export function isQuoteActionAllowed(
  action: "SEND" | "ACCEPT" | "REJECT" | "CANCEL" | "UPDATE_FINANCIALS",
  status: QuoteStatus,
): boolean {
  if (action === "SEND") {
    return ["DRAFT", "PENDING_APPROVAL"].includes(status);
  }

  if (action === "ACCEPT") {
    return ["SENT", "VIEWED"].includes(status);
  }

  if (action === "REJECT") {
    return ["SENT", "VIEWED"].includes(status);
  }

  if (action === "CANCEL") {
    return !["ACCEPTED", "REJECTED", "CANCELLED", "EXPIRED"].includes(status);
  }

  if (action === "UPDATE_FINANCIALS") {
    return ["DRAFT", "PENDING_APPROVAL", "SENT", "VIEWED"].includes(status);
  }

  return false;
}
