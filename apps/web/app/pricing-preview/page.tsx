"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { pricingApi, type PricingResultPayload } from "@/lib/apiClient";
import { UserRole } from "@pack-and-go/types";

const customerRoles = [UserRole.CUSTOMER, UserRole.BUSINESS_CUSTOMER, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OPERATIONS_MANAGER, UserRole.FINANCE];

const sampleInput = {
  pickup: { country: "GH", region: "Greater Accra", city: "Accra", address: "Spintex Road" },
  destination: { country: "GH", region: "Ashanti", city: "Kumasi", address: "Adum" },
  cargo: [{
    category: "STANDARD",
    description: "Office supply cartons",
    quantity: 3,
    weight: { value: 120, unit: "kg" },
    dimensions: { length: 60, width: 40, height: 40, unit: "cm" },
    declaredValue: { value: 1500, currency: "GHS" },
  }],
  vehicleType: "VAN",
  handlingRequirements: { loadingAssistance: true, unloadingAssistance: true },
  routeInfo: { distanceKm: 120, durationMinutes: 180, route: "Accra -> Kumasi", source: "TRUSTED_INTERNAL" },
};

export default function PricingPreviewPage() {
  const [result, setResult] = useState<PricingResultPayload | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit() {
    setIsLoading(true);
    setError("");
    try {
      const response = await pricingApi.calculate(sampleInput);
      setResult(response.pricing);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Unable to calculate price";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ProtectedRoute roles={customerRoles}>
      <Container className="py-14 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm uppercase tracking-[0.2em] text-route">Pricing preview</p>
          <h1 className="mt-3 text-4xl font-semibold">Estimate only — not an official quote</h1>
          <p className="mt-3 text-ink-muted">This preview uses the backend pricing engine and returns a detailed breakdown from the server.</p>

          <div className="mt-8 rounded-xl border border-navy-950/10 bg-white p-6 shadow-sm">
            <Button onClick={() => void submit()} disabled={isLoading}>
              {isLoading ? "Calculating..." : "Request price calculation"}
            </Button>

            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

            {result ? (
              <div className="mt-8 space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs uppercase text-slate-500">Currency</p><p className="mt-2 text-xl font-semibold">{result.currency}</p></div>
                  <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs uppercase text-slate-500">Distance</p><p className="mt-2 text-xl font-semibold">{result.distanceKm} km</p></div>
                  <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs uppercase text-slate-500">Vehicle</p><p className="mt-2 text-xl font-semibold">{result.vehicleType}</p></div>
                </div>

                <div className="overflow-hidden rounded-lg border border-navy-950/10">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 font-medium">Component</th>
                        <th className="px-4 py-3 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.breakdown.map((item) => (
                        <tr key={item.code} className="border-t border-navy-950/10">
                          <td className="px-4 py-3">{item.name}</td>
                          <td className="px-4 py-3 text-right">GHS {item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center justify-between"><span>Subtotal</span><span>GHS {result.subtotal.toLocaleString()}</span></div>
                  <div className="mt-2 flex items-center justify-between"><span>Discount</span><span>GHS {result.discount.toLocaleString()}</span></div>
                  <div className="mt-2 flex items-center justify-between"><span>Tax</span><span>GHS {result.tax.toLocaleString()}</span></div>
                  <div className="mt-4 flex items-center justify-between border-t border-navy-950/10 pt-3 text-lg font-semibold"><span>Total</span><span>GHS {result.total.toLocaleString()}</span></div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </ProtectedRoute>
  );
}
