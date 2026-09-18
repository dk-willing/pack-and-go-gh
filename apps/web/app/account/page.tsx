"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { Input, Label, Select } from "@/components/Field";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useToast } from "@/components/ToastProvider";
import {
  ApiRequestError,
  customerApi,
  type CustomerProfile,
  type SavedLocation,
} from "@/lib/apiClient";
import { GHANA_LOCATIONS, GHANA_REGIONS } from "@/lib/ghanaLocations";
import { UserRole } from "@pack-and-go/types";

const blankLocation = {
  label: "",
  country: "Ghana",
  region: "",
  city: "",
  address: "",
  instructions: "",
};
const customerRoles = [UserRole.CUSTOMER, UserRole.BUSINESS_CUSTOMER];

export default function AccountPage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState(blankLocation);
  const { showToast } = useToast();

  const load = useCallback(
    () =>
      customerApi
        .getProfile()
        .then((result) => {
          setProfile(result);
          setPhone(result.customer.phone ?? "");
          setCompanyName(result.customer.companyName ?? "");
        })
        .catch((reason) =>
          showToast(
            reason instanceof Error
              ? reason.message
              : "Unable to load your account.",
            "error",
          ),
        ),
    [showToast],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await customerApi.updateProfile({
        phone,
        companyName: companyName || undefined,
      });
      showToast("Profile updated.");
    } catch (reason) {
      showToast(
        reason instanceof ApiRequestError
          ? reason.message
          : "Unable to update profile.",
        "error",
      );
    }
  };

  const saveLocation = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await customerApi.createLocation(location);
      setLocation(blankLocation);
      await load();
      showToast("Saved location added.");
    } catch (reason) {
      showToast(
        reason instanceof ApiRequestError
          ? reason.message
          : "Unable to save location.",
        "error",
      );
    }
  };

  const removeLocation = async (saved: SavedLocation) => {
    try {
      await customerApi.deleteLocation(saved._id);
      await load();
      showToast("Saved location removed.");
    } catch (reason) {
      showToast(
        reason instanceof ApiRequestError
          ? reason.message
          : "Unable to remove location.",
        "error",
      );
    }
  };

  return (
    <ProtectedRoute roles={customerRoles}>
      <Container className="py-14 sm:py-20">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-route">
          Account
        </p>
        <h1 className="mt-3 text-4xl font-semibold">
          Profile and saved locations
        </h1>
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <form
            onSubmit={saveProfile}
            className="rounded-2xl border border-navy-950/10 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">Contact profile</h2>
            <p className="mt-2 text-sm text-ink-muted">
              {profile?.user.name} · {profile?.user.email}
            </p>
            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="company">Company name (optional)</Label>
                <Input
                  id="company"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                />
              </div>
              <Button type="submit">Save profile</Button>
            </div>
          </form>
          <form
            onSubmit={saveLocation}
            className="rounded-2xl border border-navy-950/10 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">Add saved location</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  placeholder="Home or Office"
                  value={location.label}
                  onChange={(event) =>
                    setLocation({ ...location, label: event.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={location.country}
                  onChange={(event) =>
                    setLocation({ ...location, country: event.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="region">Region</Label>
                <Select
                  id="region"
                  value={location.region}
                  onChange={(event) =>
                    setLocation({
                      ...location,
                      region: event.target.value,
                      city: "",
                    })
                  }
                  required
                >
                  <option value="">Select region</option>
                  {GHANA_REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="city">City / town</Label>
                <Select
                  id="city"
                  value={location.city}
                  onChange={(event) =>
                    setLocation({ ...location, city: event.target.value })
                  }
                  disabled={!location.region}
                  required
                >
                  <option value="">
                    {location.region
                      ? "Select city / town"
                      : "Select region first"}
                  </option>
                  {(GHANA_LOCATIONS[location.region] ?? []).map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={location.address}
                  onChange={(event) =>
                    setLocation({ ...location, address: event.target.value })
                  }
                  required
                />
              </div>
            </div>
            <Button type="submit" className="mt-6">
              Add location
            </Button>
          </form>
        </div>
        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Saved locations</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {profile?.customer.savedLocations.map((saved) => (
              <div
                key={saved._id}
                className="rounded-2xl border border-navy-950/10 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{saved.label}</h3>
                    <p className="mt-1 text-sm text-ink-muted">
                      {saved.address}, {saved.city}, {saved.region}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void removeLocation(saved)}
                    className="text-sm text-red-700 underline underline-offset-4"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </ProtectedRoute>
  );
}
