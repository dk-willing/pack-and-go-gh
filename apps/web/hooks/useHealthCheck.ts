"use client";

import { useEffect, useState } from "react";
import { healthApi } from "@/lib/apiClient";

type Status = "idle" | "loading" | "success" | "error";

/**
 * Example hook establishing the pattern for future data hooks
 * (useDeliveryRequest, useQuote, ...): own loading/error state, call the
 * API client, expose plain data to the component.
 */
export function useHealthCheck() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setStatus("loading");

    healthApi
      .check()
      .then(() => {
        if (active) setStatus("success");
      })
      .catch((err: Error) => {
        if (active) {
          setStatus("error");
          setError(err.message);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return { status, error };
}
