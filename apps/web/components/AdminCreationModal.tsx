"use client";

import { useEffect, useState } from "react";
import { authApi, ApiRequestError } from "@/lib/apiClient";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { useToast } from "./ToastProvider";

export function AdminCreationModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (open) setNewAdmin({ name: "", email: "", password: "" });
  }, [open]);

  const createAdmin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsCreating(true);
    try {
      await authApi.createAdmin(newAdmin);
      setNewAdmin({ name: "", email: "", password: "" });
      onClose();
      showToast("Admin account created successfully.");
    } catch (reason) {
      showToast(
        reason instanceof ApiRequestError
          ? reason.message
          : "Unable to create admin account.",
        "error",
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add admin">
      <p className="text-sm leading-6 text-ink-muted">
        Create a regular admin account for the operations team. Admins can
        review customer requests and manage shipment workflows.
      </p>
      <form
        onSubmit={createAdmin}
        autoComplete="off"
        className="mt-6 space-y-4"
      >
        <div>
          <label
            htmlFor="new-admin-name"
            className="block text-sm font-medium text-navy-950"
          >
            Full name
          </label>
          <input
            id="new-admin-name"
            value={newAdmin.name}
            onChange={(event) =>
              setNewAdmin({ ...newAdmin, name: event.target.value })
            }
            required
            className="mt-1.5 w-full rounded-sm border border-navy-950/15 px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="new-admin-email"
            className="block text-sm font-medium text-navy-950"
          >
            Email address
          </label>
          <input
            id="new-admin-email"
            name="new-admin-email"
            type="email"
            autoComplete="off"
            value={newAdmin.email}
            onChange={(event) =>
              setNewAdmin({ ...newAdmin, email: event.target.value })
            }
            required
            className="mt-1.5 w-full rounded-sm border border-navy-950/15 px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="new-admin-password"
            className="block text-sm font-medium text-navy-950"
          >
            Temporary password
          </label>
          <input
            id="new-admin-password"
            name="new-admin-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={newAdmin.password}
            onChange={(event) =>
              setNewAdmin({ ...newAdmin, password: event.target.value })
            }
            required
            className="mt-1.5 w-full rounded-sm border border-navy-950/15 px-3 py-2.5 text-sm"
          />
          <p className="mt-1.5 text-xs text-ink-muted">
            At least 8 characters.
          </p>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? "Creating..." : "Create admin"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
