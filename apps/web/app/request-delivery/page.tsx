"use client";

import { useState } from "react";
import { Container } from "@/components/Container";
import { Label, Input, Select, Textarea } from "@/components/Field";
import { Button } from "@/components/Button";

// Regional locations data
const REGIONAL_LOCATIONS: Record<string, string[]> = {
  Ashanti: [
    "Kumasi Central (Kejetia / Adum)",
    "KNUST Campus / Ayeduase",
    "Asokwa Industrial Area",
    "Obuasi",
    "Ejisu",
    "Mampong",
    "Offinso",
    "Suame Magazine",
  ],
  "Greater Accra": [
    "Accra Central / Ridge",
    "Legon (UG Campus) / Madina",
    "Tema Harbour & Industrial Zone",
    "Spintex / East Legon",
    "Kaneshie / Industrial Area",
    "Kasoa (Border)",
    "Adenta",
    "Kotoka Airport Cargo Terminal",
  ],
  Western: [
    "Takoradi Port Area",
    "Sekondi",
    "Tarkwa (Mining Zone)",
    "Axim",
    "Elubo (Border)",
  ],
  Central: [
    "Cape Coast (UCC Campus)",
    "Winneba",
    "Mfantseman / Saltpond",
    "Elmina",
  ],
  Eastern: ["Koforidua", "Nkawkaw", "Akosombo", "Suhum"],
  Northern: ["Tamale Central / UDS Campus", "Yendi", "Savelugu"],
  Bono: ["Sunyani", "Berekum", "Techiman (Market Hub)"],
  Volta: ["Ho", "Aflao (Border)", "Kpando"],
};

interface CustomCargoItem {
  id: string;
  description: string;
  quantity: number;
  weightOrSize: string;
}

export default function RequestDeliveryPage() {
  // Pickup Selection State
  const [pickupRegion, setPickupRegion] = useState("");
  const [pickupArea, setPickupArea] = useState("");
  const [customPickupArea, setCustomPickupArea] = useState("");

  // Destination Selection State
  const [destRegion, setDestRegion] = useState("");
  const [destArea, setDestArea] = useState("");
  const [customDestArea, setCustomDestArea] = useState("");

  // Cargo & Student Specific State
  const [cargoType, setCargoType] = useState("");
  const [studentItems, setStudentItems] = useState({
    trunks: 0,
    suitcases: 0,
    backpacks: 0,
    hasFridge: false,
    hasGasCylinder: false,
    hasTV: false,
    hasMattress: false,
    hasMicrowave: false,
    hasFan: false,
    hasPlasticChairsTable: false,
  });

  // Dynamic Item List for All Categories (including Student extras)
  const [customItems, setCustomItems] = useState<CustomCargoItem[]>([
    { id: "1", description: "", quantity: 1, weightOrSize: "" },
  ]);

  // Form Submission State
  const [submitted, setSubmitted] = useState(false);

  // Student quantity modifiers
  const handleStudentQuantityChange = (field: string, delta: number) => {
    setStudentItems((prev) => ({
      ...prev,
      [field]: Math.max(
        0,
        (prev[field as keyof typeof prev] as number) + delta,
      ),
    }));
  };

  const handleStudentToggle = (field: string) => {
    setStudentItems((prev) => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev],
    }));
  };

  // Custom Item Handlers
  const handleAddCustomItem = () => {
    setCustomItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        description: "",
        quantity: 1,
        weightOrSize: "",
      },
    ]);
  };

  const handleRemoveCustomItem = (id: string) => {
    if (customItems.length === 1) return; // Keep at least one item input
    setCustomItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCustomItemChange = (
    id: string,
    field: keyof CustomCargoItem,
    value: string | number,
  ) => {
    setCustomItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out blank custom items
    const validCustomItems = customItems.filter(
      (item) => item.description.trim().length > 0,
    );

    const payload = {
      pickupRegion,
      pickupLocation: finalPickupLocation,
      destRegion,
      destLocation: finalDestLocation,
      cargoType,
      studentPresetInventory: cargoType === "student" ? studentItems : null,
      customItemizedCargo: validCustomItems,
      notes: (e.target as HTMLFormElement).notes.value,
    };

    try {
      const response = await fetch("https://formspree.io/f/xwlpkzgb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert("Failed to submit request. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const finalPickupLocation =
    pickupArea === "Other" ? customPickupArea : pickupArea;
  const finalDestLocation = destArea === "Other" ? customDestArea : destArea;

  return (
    <div className="bg-slate-50/50 py-16 sm:py-20">
      <Container>
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            Instant Route & Freight Calculation
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Request a Delivery Quote
          </h1>
          <p className="mt-3 text-base text-gray-600">
            Select your route regions and cargo specifications to receive an
            instant dispatch quote.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-10">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pickup Location Section */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  01. Pickup Location
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="pickupRegion">Pickup Region</Label>
                    <Select
                      id="pickupRegion"
                      name="pickupRegion"
                      value={pickupRegion}
                      onChange={(e) => {
                        setPickupRegion(e.target.value);
                        setPickupArea("");
                        setCustomPickupArea("");
                      }}
                      required
                    >
                      <option value="">Select Region</option>
                      {Object.keys(REGIONAL_LOCATIONS).map((region) => (
                        <option key={region} value={region}>
                          {region} Region
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="pickupArea">Pickup Area / District</Label>
                    <Select
                      id="pickupArea"
                      name="pickupArea"
                      value={pickupArea}
                      onChange={(e) => setPickupArea(e.target.value)}
                      disabled={!pickupRegion}
                      required
                    >
                      <option value="">
                        {pickupRegion ? "Select Area" : "Select Region First"}
                      </option>
                      {pickupRegion && (
                        <>
                          {REGIONAL_LOCATIONS[pickupRegion]?.map((area) => (
                            <option key={area} value={area}>
                              {area}
                            </option>
                          ))}
                          <option value="Other">Other (Specify below)</option>
                        </>
                      )}
                    </Select>
                  </div>
                </div>

                {/* Custom Pickup Area Input */}
                {pickupArea === "Other" && (
                  <div className="pt-2">
                    <Label htmlFor="customPickupArea">
                      Specify Pickup Town / Area
                    </Label>
                    <Input
                      id="customPickupArea"
                      name="customPickupArea"
                      type="text"
                      placeholder="e.g. Tafo, Tanoso, or specific landmark"
                      value={customPickupArea}
                      onChange={(e) => setCustomPickupArea(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Destination Location Section */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  02. Destination Location
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="destRegion">Destination Region</Label>
                    <Select
                      id="destRegion"
                      name="destRegion"
                      value={destRegion}
                      onChange={(e) => {
                        setDestRegion(e.target.value);
                        setDestArea("");
                        setCustomDestArea("");
                      }}
                      required
                    >
                      <option value="">Select Region</option>
                      {Object.keys(REGIONAL_LOCATIONS).map((region) => (
                        <option key={region} value={region}>
                          {region} Region
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="destArea">
                      Destination Area / District
                    </Label>
                    <Select
                      id="destArea"
                      name="destArea"
                      value={destArea}
                      onChange={(e) => setDestArea(e.target.value)}
                      disabled={!destRegion}
                      required
                    >
                      <option value="">
                        {destRegion ? "Select Area" : "Select Region First"}
                      </option>
                      {destRegion && (
                        <>
                          {REGIONAL_LOCATIONS[destRegion]?.map((area) => (
                            <option key={area} value={area}>
                              {area}
                            </option>
                          ))}
                          <option value="Other">Other (Specify below)</option>
                        </>
                      )}
                    </Select>
                  </div>
                </div>

                {/* Custom Destination Area Input */}
                {destArea === "Other" && (
                  <div className="pt-2">
                    <Label htmlFor="customDestArea">
                      Specify Destination Town / Area
                    </Label>
                    <Input
                      id="customDestArea"
                      name="customDestArea"
                      type="text"
                      placeholder="e.g. Madina Zongo, Pokuase, or landmark"
                      value={customDestArea}
                      onChange={(e) => setCustomDestArea(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Cargo Classification */}
              <div>
                <Label htmlFor="cargoType">Cargo Type & Service Category</Label>
                <Select
                  id="cargoType"
                  name="cargoType"
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select cargo type
                  </option>
                  <option value="student">
                    Student Express & Hostel Relocation
                  </option>
                  <option value="standard">
                    Standard Package / E-commerce Parcel
                  </option>
                  <option value="bulk">Bulk Goods & Wholesaler Freight</option>
                  <option value="heavy">
                    Heavy-Duty Equipment & Machinery
                  </option>
                  <option value="oversized">
                    Oversized & Special Clearance Cargo
                  </option>
                  <option value="special">
                    Special Handling (Temperature / High-Value)
                  </option>
                </Select>
              </div>

              {/* Student Preset Checklist (Only shows for Student category) */}
              {cargoType === "student" && (
                <div className="rounded-2xl bg-amber-50/60 p-5 border border-amber-200/80 space-y-5">
                  <div>
                    <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                      🎓 Common Hostel Essentials
                    </h3>
                    <p className="text-xs text-amber-800/80 mt-0.5">
                      Select common items or add custom items below.
                    </p>
                  </div>

                  {/* Quantity Items */}
                  <div className="space-y-3 bg-white/80 p-3.5 rounded-xl border border-amber-100">
                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Bags & Luggage Quantities
                    </p>

                    {[
                      { key: "trunks", label: "Metal Trunks / Chop Boxes" },
                      { key: "suitcases", label: "Suitcases / Traveling Bags" },
                      { key: "backpacks", label: "Backpacks / Sack Bags" },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between py-1 border-b border-slate-100 last:border-b-0"
                      >
                        <span className="text-sm text-slate-700">
                          {item.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleStudentQuantityChange(item.key, -1)
                            }
                            className="h-7 w-7 rounded-md bg-slate-200 text-slate-700 font-bold hover:bg-slate-300"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-sm font-semibold text-slate-900">
                            {
                              studentItems[
                                item.key as keyof typeof studentItems
                              ]
                            }
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleStudentQuantityChange(item.key, 1)
                            }
                            className="h-7 w-7 rounded-md bg-amber-500 text-white font-bold hover:bg-amber-600"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Appliances & Essentials Toggle Grid */}
                  <div className="space-y-3 bg-white/80 p-3.5 rounded-xl border border-amber-100">
                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Hostel Appliances & Essentials
                    </p>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 text-xs font-medium text-slate-700">
                      {[
                        { key: "hasFridge", label: "Table Fridge / Freezer" },
                        {
                          key: "hasGasCylinder",
                          label: "Gas Cylinder & Burner",
                        },
                        { key: "hasTV", label: "Television Screen" },
                        {
                          key: "hasMattress",
                          label: "Mattress (Student Size)",
                        },
                        { key: "hasMicrowave", label: "Microwave / Air Fryer" },
                        { key: "hasFan", label: "Standing Fan" },
                        {
                          key: "hasPlasticChairsTable",
                          label: "Study Table / Chair",
                        },
                      ].map((item) => {
                        const isChecked = Boolean(
                          studentItems[item.key as keyof typeof studentItems],
                        );
                        return (
                          <label
                            key={item.key}
                            onClick={() => handleStudentToggle(item.key)}
                            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                              isChecked
                                ? "bg-amber-100/80 border-amber-400 text-amber-950 font-semibold"
                                : "bg-white border-slate-200 hover:border-slate-300 text-slate-600"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                            />
                            <span>{item.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Specific Itemization Section for ALL Categories */}
              {cargoType && (
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
                        Itemized Cargo Details
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {cargoType === "student"
                          ? "Add any extra items not included in the checklist above."
                          : "Specify individual items, quantities, and estimated sizes/weights."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {customItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-12 gap-2 items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm"
                      >
                        {/* Item Description */}
                        <div className="col-span-12 sm:col-span-5">
                          <Input
                            type="text"
                            placeholder={
                              cargoType === "student"
                                ? "e.g., Bucket, Shoe rack, Mirror"
                                : cargoType === "bulk"
                                  ? "e.g., Bags of Rice, Cement, Tiles"
                                  : "Item Description"
                            }
                            value={item.description}
                            onChange={(e) =>
                              handleCustomItemChange(
                                item.id,
                                "description",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        {/* Quantity */}
                        <div className="col-span-5 sm:col-span-3 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleCustomItemChange(
                                item.id,
                                "quantity",
                                Math.max(1, item.quantity - 1),
                              )
                            }
                            className="h-9 w-9 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                          >
                            -
                          </button>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleCustomItemChange(
                                item.id,
                                "quantity",
                                parseInt(e.target.value) || 1,
                              )
                            }
                            className="text-center font-semibold"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleCustomItemChange(
                                item.id,
                                "quantity",
                                item.quantity + 1,
                              )
                            }
                            className="h-9 w-9 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                          >
                            +
                          </button>
                        </div>

                        {/* Weight or Size */}
                        <div className="col-span-5 sm:col-span-3">
                          <Input
                            type="text"
                            placeholder="e.g. 20kg, 2x3 ft"
                            value={item.weightOrSize}
                            onChange={(e) =>
                              handleCustomItemChange(
                                item.id,
                                "weightOrSize",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        {/* Remove Action Button */}
                        <div className="col-span-2 sm:col-span-1 flex justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomItem(item.id)}
                            disabled={customItems.length === 1}
                            className="text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-400 p-1"
                            title="Remove item"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCustomItem}
                    className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 hover:text-amber-700 pt-1"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                      +
                    </span>
                    Add Another Item
                  </button>
                </div>
              )}

              {/* Cargo Notes */}
              <div>
                <Label htmlFor="notes">
                  Cargo Description & Special Instructions
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  placeholder="Specify weight, dimensions, fragile items, hostel block/room number..."
                />
              </div>

              {/* Action */}
              <div className="pt-2">
                <Button type="submit" className="w-full">
                  Generate Instant Delivery Quote
                </Button>
              </div>
            </form>
          ) : (
            /* Confirmation State */
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="font-display text-2xl font-bold text-gray-900">
                Quote Request Received!
              </h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Route:{" "}
                <span className="font-semibold text-gray-900">
                  {finalPickupLocation} ({pickupRegion})
                </span>{" "}
                to{" "}
                <span className="font-semibold text-gray-900">
                  {finalDestLocation} ({destRegion})
                </span>
                .
              </p>
              <p className="text-xs text-slate-500">
                Our dispatch team is reviewing your route clearance and driver
                availability. You will receive an SMS/Email quote within 15
                minutes.
              </p>
              <div className="pt-4">
                <Button onClick={() => setSubmitted(false)} variant="secondary">
                  Submit Another Request
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
