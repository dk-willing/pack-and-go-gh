import assert from "node:assert/strict";
import test from "node:test";
import {
  canTransitionQuoteStatus,
  isQuoteActionAllowed,
  QUOTE_STATUS_TRANSITIONS,
} from "./quoteStatus";

test("quote status transitions include the expected rules", () => {
  assert.equal(canTransitionQuoteStatus("DRAFT", "PENDING_APPROVAL"), true);
  assert.equal(canTransitionQuoteStatus("SENT", "ACCEPTED"), true);
  assert.equal(canTransitionQuoteStatus("ACCEPTED", "SENT"), false);
  assert.ok(QUOTE_STATUS_TRANSITIONS.DRAFT.includes("SENT"));
});

test("expired or rejected quotes cannot be accepted", () => {
  assert.equal(isQuoteActionAllowed("ACCEPT", "EXPIRED"), false);
  assert.equal(isQuoteActionAllowed("ACCEPT", "REJECTED"), false);
  assert.equal(isQuoteActionAllowed("ACCEPT", "CANCELLED"), false);
});

test("accepted quotes are locked against financial edits", () => {
  assert.equal(isQuoteActionAllowed("UPDATE_FINANCIALS", "ACCEPTED"), false);
  assert.equal(isQuoteActionAllowed("UPDATE_FINANCIALS", "SENT"), true);
});
