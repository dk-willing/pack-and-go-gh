"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { Input, Label, Select, Textarea } from "@/components/Field";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useToast } from "@/components/ToastProvider";
import {
  ApiRequestError,
  customerApi,
  deliveryRequestApi,
  type CargoCategory,
  type ContactInput,
  type LocationInput,
  type SavedLocation,
} from "@/lib/apiClient";
import { GHANA_LOCATIONS, GHANA_REGIONS } from "@/lib/ghanaLocations";
import { UserRole } from "@pack-and-go/types";

const customerRoles = [UserRole.CUSTOMER, UserRole.BUSINESS_CUSTOMER];

export type ExtendedCargoCategory = CargoCategory | "STUDENT" | "";

export interface CargoItemState {
  id: string;
  preset: string;
  description: string;
  quantity: number;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
}

const STUDENT_ITEM_PRESETS = [
  "Hostel Trunk / Metal Box",
  "Duffel Bag / Suitcase",
  "Hostel Mattress (Single/Double)",
  "Bucket & Kitchenware Set",
  "Mini Refrigerator / Fridge",
  "Desktop Computer / TV Box",
  "Study Desk / Chair",
  "Gas Cylinder & Stove Set",
  "Standing / Table Fan",
  "OTHER_CUSTOM",
];

const CATEGORY_PRESETS: Record<Exclude<ExtendedCargoCategory, "">, string[]> = {
  STUDENT: STUDENT_ITEM_PRESETS,
  STANDARD: [
    "Boxed Parcels",
    "Personal Luggage",
    "Documents / Books",
    "OTHER_CUSTOM",
  ],
  BULK: [
    "Sacks / Bags of Grain",
    "Crate Boxes",
    "Construction Supplies",
    "OTHER_CUSTOM",
  ],
  HEAVY: [
    "Heavy Machinery",
    "Generator / Engine",
    "Furniture / Wardrobe",
    "OTHER_CUSTOM",
  ],
  OVERSIZED: [
    "Large Display Units",
    "Pipes / Rods Bundle",
    "Industrial Equipment",
    "OTHER_CUSTOM",
  ],
  SPECIAL_HANDLING: [
    "Fragile Glassware",
    "Perishable Foods",
    "Electronics / Server Hardware",
    "OTHER_CUSTOM",
  ],
};

const emptyLocation: LocationInput = {
  country: "Ghana",
  region: "",
  city: "",
  address: "",
};
const emptyContact: ContactInput = { name: "", phone: "", email: "" };

const createEmptyCargoItem = (): CargoItemState => ({
  id:
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(),
  preset: "",
  description: "",
  quantity: 1,
  weight: "",
  dimensions: { length: "", width: "", height: "" },
});

function getTomorrowDateValue() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

export default function RequestDeliveryPage() {
  const [step, setStep] = useState(1);
  const [pickup, setPickup] = useState(emptyLocation);
  const [destination, setDestination] = useState(emptyLocation);
  const [pickupContact, setPickupContact] = useState(emptyContact);
  const [destinationContact, setDestinationContact] = useState(emptyContact);

  // Global category selected ONCE for the whole shipment
  const [cargoCategory, setCargoCategory] = useState<ExtendedCargoCategory>("");
  const [cargoItems, setCargoItems] = useState<CargoItemState[]>([
    createEmptyCargoItem(),
  ]);

  const [preferredPickupDate, setPreferredPickupDate] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [notes, setNotes] = useState("");
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<{
    requestNumber: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    customerApi
      .listLocations()
      .then((result) => setLocations(result.locations))
      .catch(() => undefined);
  }, []);

  const updateLocation = (
    kind: "pickup" | "destination",
    key: keyof LocationInput,
    value: string,
  ) => {
    const setter = kind === "pickup" ? setPickup : setDestination;
    setter((current) => ({ ...current, [key]: value }));
  };

  const updateRegion = (kind: "pickup" | "destination", region: string) => {
    const setter = kind === "pickup" ? setPickup : setDestination;
    setter((current) => ({ ...current, region, city: "" }));
  };

  const applySaved = (kind: "pickup" | "destination", id: string) => {
    const location = locations.find((item) => item._id === id);
    if (!location) return;
    const value = {
      country: location.country,
      region: location.region,
      city: location.city,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      locationNotes: location.instructions,
    };
    if (kind === "pickup") setPickup(value);
    else setDestination(value);
  };

  const handleCategoryChange = (category: ExtendedCargoCategory) => {
    setCargoCategory(category);
    // Reset preset & description for all items when category changes
    setCargoItems((prev) =>
      prev.map((item) => ({
        ...item,
        preset: "",
        description: "",
      })),
    );
  };

  const addCargoItem = () => {
    setCargoItems((prev) => [...prev, createEmptyCargoItem()]);
  };

  const removeCargoItem = (id: string) => {
    if (cargoItems.length === 1) return;
    setCargoItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updatePreset = (id: string, preset: string) => {
    setCargoItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              preset,
              description: preset === "OTHER_CUSTOM" ? "" : preset,
            }
          : item,
      ),
    );
  };

  const updateCargoItem = (
    id: string,
    field: keyof CargoItemState,
    value: unknown,
  ) => {
    setCargoItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const updateDimension = (
    id: string,
    dimension: "length" | "width" | "height",
    value: string,
  ) => {
    setCargoItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              dimensions: { ...item.dimensions, [dimension]: value },
            }
          : item,
      ),
    );
  };

  const validateStep = (targetStep: number): string => {
    if (
      targetStep === 1 &&
      (!pickup.region ||
        !pickup.city ||
        !pickup.address ||
        !pickupContact.name ||
        !pickupContact.phone)
    ) {
      return "Complete the pickup location and contact fields.";
    }

    if (
      targetStep === 2 &&
      (!destination.region ||
        !destination.city ||
        !destination.address ||
        !destinationContact.name ||
        !destinationContact.phone)
    ) {
      return "Complete the destination location and contact fields.";
    }

    if (targetStep === 3) {
      if (!preferredPickupDate) return "Please select a preferred pickup date.";
      if (preferredPickupDate < getTomorrowDateValue()) {
        return "Preferred pickup date must be tomorrow or later.";
      }
      if (!cargoCategory) return "Please choose a cargo category.";
      if (cargoItems.length === 0) return "Please add at least one cargo item.";

      for (let i = 0; i < cargoItems.length; i++) {
        const item = cargoItems[i];
        if (!item.description || item.quantity < 1) {
          return `Please select or specify a description and valid quantity for item #${i + 1}.`;
        }
        if (
          (cargoCategory === "HEAVY" || cargoCategory === "OVERSIZED") &&
          (!item.weight ||
            !Number.isFinite(Number(item.weight)) ||
            Number(item.weight) <= 0)
        ) {
          return `Weight is required for heavy or oversized cargo (item #${i + 1}).`;
        }
        if (
          cargoCategory === "OVERSIZED" &&
          (!item.dimensions.length ||
            !item.dimensions.width ||
            !item.dimensions.height ||
            !Number.isFinite(Number(item.dimensions.length)) ||
            !Number.isFinite(Number(item.dimensions.width)) ||
            !Number.isFinite(Number(item.dimensions.height)) ||
            Number(item.dimensions.length) <= 0 ||
            Number(item.dimensions.width) <= 0 ||
            Number(item.dimensions.height) <= 0)
        ) {
          return `All dimensions are required for oversized cargo (item #${i + 1}).`;
        }
      }

      if (cargoCategory === "SPECIAL_HANDLING" && !specialInstructions) {
        return "Special instructions are required when special handling cargo is selected.";
      }
    }

    return "";
  };

  const next = () => {
    const message = validateStep(step);
    if (message) showToast(message, "error");
    else setStep((current) => Math.min(4, current + 1));
  };

  const submit = async () => {
    for (let s = 1; s <= 3; s++) {
      const message = validateStep(s);
      if (message) {
        showToast(message, "error");
        setStep(s);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const formattedCargo = cargoItems.map((item) => ({
        category: (cargoCategory === "STUDENT"
          ? "STANDARD"
          : cargoCategory) as CargoCategory,
        description:
          cargoCategory === "STUDENT"
            ? `[Student Move] ${item.description}`
            : item.description,
        quantity: item.quantity,
        ...(item.weight
          ? { weight: { value: Number(item.weight), unit: "kg" as const } }
          : {}),
        ...(cargoCategory === "OVERSIZED"
          ? {
              dimensions: {
                length: Number(item.dimensions.length),
                width: Number(item.dimensions.width),
                height: Number(item.dimensions.height),
                unit: "m" as const,
              },
            }
          : {}),
      }));

      const result = await deliveryRequestApi.create({
        pickup,
        destination,
        pickupContact,
        destinationContact,
        cargo: formattedCargo,
        preferredPickupDate,
        handlingRequirements: specialInstructions
          ? { specialInstructions }
          : undefined,
        notes: notes || undefined,
      });

      setCreatedRequest({
        requestNumber: result.request.requestNumber,
        status: result.request.status,
      });
    } catch (reason) {
      if (reason instanceof ApiRequestError) {
        const details = reason.errors
          ? Object.entries(reason.errors)
              .flatMap(([field, messages]) =>
                messages.map((message) => `${field}: ${message}`),
              )
              .join(" ")
          : "";
        showToast(
          details ? `${reason.message} ${details}` : reason.message,
          "error",
        );
      } else {
        showToast("Unable to submit the request.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderLocation = (
    kind: "pickup" | "destination",
    value: LocationInput,
    contact: ContactInput,
    setContact: Dispatch<SetStateAction<ContactInput>>,
  ) => (
    <div className="space-y-5">
      <div>
        <Label>Use saved location</Label>
        <Select
          defaultValue=""
          onChange={(event) => applySaved(kind, event.target.value)}
        >
          <option value="">Enter a new location</option>
          {locations.map((location) => (
            <option key={location._id} value={location._id}>
              {location.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${kind}-country`}>Country</Label>
          <Input
            id={`${kind}-country`}
            value={value.country}
            onChange={(event) =>
              updateLocation(kind, "country", event.target.value)
            }
            required
          />
        </div>
        <div>
          <Label htmlFor={`${kind}-region`}>Region</Label>
          <Select
            id={`${kind}-region`}
            value={value.region}
            onChange={(event) => updateRegion(kind, event.target.value)}
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
          <Label htmlFor={`${kind}-city`}>City / town</Label>
          <Select
            id={`${kind}-city`}
            value={value.city}
            onChange={(event) =>
              updateLocation(kind, "city", event.target.value)
            }
            disabled={!value.region}
            required
          >
            <option value="">
              {value.region ? "Select city / town" : "Select region first"}
            </option>
            {(GHANA_LOCATIONS[value.region] ?? []).map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={`${kind}-address`}>Address / Name Of Area</Label>
          <Input
            id={`${kind}-address`}
            value={value.address}
            onChange={(event) =>
              updateLocation(kind, "address", event.target.value)
            }
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor={`${kind}-notes`}>Location notes (optional)</Label>
        <Textarea
          id={`${kind}-notes`}
          value={value.locationNotes ?? ""}
          onChange={(event) =>
            updateLocation(kind, "locationNotes", event.target.value)
          }
          rows={2}
        />
      </div>
      <h2 className="pt-2 text-lg font-semibold">Contact person</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${kind}-contact-name`}>Name</Label>
          <Input
            id={`${kind}-contact-name`}
            value={contact.name}
            onChange={(event) =>
              setContact((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            required
          />
        </div>
        <div>
          <Label htmlFor={`${kind}-contact-phone`}>Phone</Label>
          <Input
            id={`${kind}-contact-phone`}
            value={contact.phone}
            onChange={(event) =>
              setContact((current) => ({
                ...current,
                phone: event.target.value,
              }))
            }
            required
          />
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute roles={customerRoles}>
      <Container className="py-14 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-route">
            New request
          </p>
          <h1 className="mt-3 text-4xl font-semibold">
            Tell us what needs moving
          </h1>
          {createdRequest ? (
            <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-8">
              <h2 className="text-2xl font-semibold text-emerald-950">
                Request submitted
              </h2>
              <p className="mt-2 text-emerald-900">
                Your request number is{" "}
                <strong>{createdRequest.requestNumber}</strong>. Status:{" "}
                {createdRequest.status}.
              </p>
              <div className="mt-6 flex gap-3">
                <Button href="/dashboard">View dashboard</Button>
                <Button href="/request-delivery" variant="secondary">
                  Create another
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-navy-950/10 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-8 grid grid-cols-4 gap-2">
                {["Pickup", "Destination", "Cargo", "Review"].map(
                  (label, index) => (
                    <div
                      key={label}
                      className={`border-t-2 pt-2 text-xs font-semibold ${step === index + 1 ? "border-route text-navy-950" : "border-navy-950/15 text-ink-muted"}`}
                    >
                      {index + 1}. {label}
                    </div>
                  ),
                )}
              </div>
              {step === 1 &&
                renderLocation(
                  "pickup",
                  pickup,
                  pickupContact,
                  setPickupContact,
                )}
              {step === 2 &&
                renderLocation(
                  "destination",
                  destination,
                  destinationContact,
                  setDestinationContact,
                )}
              {step === 3 && (
                <div className="space-y-8">
                  <div>
                    <Label htmlFor="preferred-date">
                      Preferred pickup date
                    </Label>
                    <Input
                      id="preferred-date"
                      type="date"
                      min={getTomorrowDateValue()}
                      value={preferredPickupDate}
                      onChange={(event) =>
                        setPreferredPickupDate(event.target.value)
                      }
                      required
                    />
                  </div>

                  {/* STEP-LEVEL CATEGORY SELECTION */}
                  <div>
                    <Label htmlFor="global-cargo-category">
                      Cargo Category
                    </Label>
                    <Select
                      id="global-cargo-category"
                      value={cargoCategory}
                      onChange={(e) =>
                        handleCategoryChange(
                          e.target.value as ExtendedCargoCategory,
                        )
                      }
                    >
                      <option value="">-- Choose Category --</option>
                      <option value="STUDENT">Student / Hostel Move</option>
                      <option value="STANDARD">Standard</option>
                      <option value="BULK">Bulk</option>
                      <option value="HEAVY">Heavy</option>
                      <option value="OVERSIZED">Oversized</option>
                      <option value="SPECIAL_HANDLING">Special handling</option>
                    </Select>
                  </div>

                  {cargoCategory && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Cargo items</h2>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={addCargoItem}
                        >
                          + Add item
                        </Button>
                      </div>

                      {cargoItems.map((item, index) => (
                        <div
                          key={item.id}
                          className="relative space-y-4 rounded-xl border border-navy-950/10 p-4 sm:p-5"
                        >
                          <div className="flex items-center justify-between border-b pb-2">
                            <span className="font-semibold text-sm">
                              Item #{index + 1}
                            </span>
                            {cargoItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeCargoItem(item.id)}
                                className="text-xs font-medium text-red-600 hover:underline"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div>
                            <Label htmlFor={`preset-${item.id}`}>
                              Select item type
                            </Label>
                            <Select
                              id={`preset-${item.id}`}
                              value={item.preset}
                              onChange={(e) =>
                                updatePreset(item.id, e.target.value)
                              }
                            >
                              <option value="">-- Choose item preset --</option>
                              {CATEGORY_PRESETS[cargoCategory].map((preset) => (
                                <option key={preset} value={preset}>
                                  {preset === "OTHER_CUSTOM"
                                    ? "+ Add item not found in list (Custom)"
                                    : preset}
                                </option>
                              ))}
                            </Select>
                          </div>

                          {(item.preset === "OTHER_CUSTOM" ||
                            (!item.preset && cargoCategory !== "STUDENT")) && (
                            <div>
                              <Label htmlFor={`description-${item.id}`}>
                                {cargoCategory === "STUDENT"
                                  ? "Specify unlisted student item"
                                  : "Item Description"}
                              </Label>
                              <Textarea
                                id={`description-${item.id}`}
                                placeholder={
                                  cargoCategory === "STUDENT"
                                    ? "e.g., Plastic buckets, dish drying rack, study lamp"
                                    : "Describe the item..."
                                }
                                value={item.description}
                                onChange={(e) =>
                                  updateCargoItem(
                                    item.id,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                required
                              />
                            </div>
                          )}

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <Label htmlFor={`quantity-${item.id}`}>
                                Quantity
                              </Label>
                              <Input
                                id={`quantity-${item.id}`}
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) =>
                                  updateCargoItem(
                                    item.id,
                                    "quantity",
                                    Number(e.target.value),
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor={`weight-${item.id}`}>
                                Weight in kg{" "}
                                {cargoCategory === "HEAVY" ||
                                cargoCategory === "OVERSIZED"
                                  ? "(required)"
                                  : "(optional)"}
                              </Label>
                              <Input
                                id={`weight-${item.id}`}
                                type="number"
                                min={0}
                                value={item.weight}
                                onChange={(e) =>
                                  updateCargoItem(
                                    item.id,
                                    "weight",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>

                          {cargoCategory === "OVERSIZED" && (
                            <div className="grid gap-4 sm:grid-cols-3">
                              {(["length", "width", "height"] as const).map(
                                (dim) => (
                                  <div key={dim}>
                                    <Label htmlFor={`${dim}-${item.id}`}>
                                      {dim} in metres
                                    </Label>
                                    <Input
                                      id={`${dim}-${item.id}`}
                                      type="number"
                                      min={0}
                                      value={item.dimensions[dim]}
                                      onChange={(e) =>
                                        updateDimension(
                                          item.id,
                                          dim,
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="special-instructions">
                      Special instructions{" "}
                      {cargoCategory === "SPECIAL_HANDLING"
                        ? "(required)"
                        : "(optional)"}
                    </Label>
                    <Textarea
                      id="special-instructions"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional notes (optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              )}
              {step === 4 && (
                <div className="space-y-5 text-sm">
                  <h2 className="text-2xl font-semibold">
                    Review your request
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="font-semibold">Pickup</p>
                      <p className="text-ink-muted">
                        {pickup.address}, {pickup.city}, {pickup.region}
                      </p>
                      <p className="text-ink-muted">
                        {pickupContact.name} · {pickupContact.phone}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">Destination</p>
                      <p className="text-ink-muted">
                        {destination.address}, {destination.city},{" "}
                        {destination.region}
                      </p>
                      <p className="text-ink-muted">
                        {destinationContact.name} · {destinationContact.phone}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">
                      Cargo Category: {cargoCategory} ({cargoItems.length}{" "}
                      item(s))
                    </p>
                    <div className="mt-2 space-y-2">
                      {cargoItems.map((item, idx) => (
                        <p key={item.id} className="text-ink-muted">
                          #{idx + 1}: {item.description} (Qty: {item.quantity}
                          {item.weight ? `, ${item.weight}kg` : ""})
                        </p>
                      ))}
                    </div>
                  </div>
                  <p className="text-ink-muted">
                    Preferred pickup: {preferredPickupDate}
                  </p>
                </div>
              )}
              <div className="mt-8 flex justify-between gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep((current) => Math.max(1, current - 1))}
                  disabled={step === 1}
                >
                  Back
                </Button>
                {step < 4 ? (
                  <Button type="button" onClick={next}>
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => void submit()}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit request"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </Container>
    </ProtectedRoute>
  );
}
