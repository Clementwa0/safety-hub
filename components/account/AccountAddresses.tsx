"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useCustomerSession } from "@/hooks/use-customer-session";
import { Plus, MapPin, Phone, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { AddressFormDialog } from "@/components/account/AddressFormDialog";
import { addressService } from "@/services/storefront/address.service";
import type { Address } from "@/types/storefront/address";
import type { AddressFormValues } from "@/lib/validation/address";

export default function AccountAddresses() {
  const { status } = useCustomerSession();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  function loadAddresses() {
    setLoading(true);
    setError(null);

    return addressService
      .list()
      .then((result) => setAddresses(result))
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load your addresses"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);

    addressService
      .list()
      .then((result) => {
        if (!cancelled) setAddresses(result);
      })
      .catch((caught) => {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Could not load your addresses");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  function openAddDialog() {
    setEditingAddress(null);
    setFormOpen(true);
  }

  function openEditDialog(address: Address) {
    setEditingAddress(address);
    setFormOpen(true);
  }

  async function handleFormSubmit(values: AddressFormValues) {
    setSaving(true);

    try {
      if (editingAddress) {
        const updated = await addressService.update(editingAddress.id, values);
        setAddresses((prev) =>
          prev.map((item) =>
            item.id === updated.id ? updated : updated.isDefault ? { ...item, isDefault: false } : item,
          ),
        );
        toast.success("Address updated");
      } else {
        const created = await addressService.create(values);
        setAddresses((prev) => [
          created,
          ...prev.map((item) => (created.isDefault ? { ...item, isDefault: false } : item)),
        ]);
        toast.success("Address added");
      }

      setFormOpen(false);
      setEditingAddress(null);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not save this address");
    } finally {
      setSaving(false);
    }
  }

  async function handleSetDefault(address: Address) {
    if (address.isDefault) return;

    setSettingDefaultId(address.id);
    try {
      await addressService.setDefault(address.id);
      setAddresses((prev) => prev.map((item) => ({ ...item, isDefault: item.id === address.id })));
      toast.success("Default address updated");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not set default address");
    } finally {
      setSettingDefaultId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await addressService.remove(deleteTarget.id);
      setAddresses((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      toast.success("Address removed");
      setDeleteTarget(null);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not remove this address");
    } finally {
      setDeleting(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6">
        <div className="h-9 w-40 animate-pulse rounded-xl bg-muted" />
        <div className="space-y-3">
          <div className="h-28 animate-pulse rounded-2xl bg-muted" />
          <div className="h-28 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="rounded-2xl border border-border bg-white p-10 text-center shadow-[var(--shadow-soft)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Login required</p>
        <h1 className="mt-4 text-2xl font-semibold text-foreground sm:text-3xl">Manage your addresses</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to save delivery addresses and reuse them at checkout.
        </p>
        <Button onClick={() => signIn("google", { callbackUrl: "/account/addresses" })} className="mt-8 rounded-xl px-6 py-3">
          Sign in with Google
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Addresses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Save delivery addresses so checkout autofills them for you.
          </p>
        </div>
        <Button onClick={openAddDialog} className="gap-2 rounded-xl px-4">
          <Plus className="h-4 w-4" />
          Add address
        </Button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
          {error}
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={() => void loadAddresses()}>
              Try again
            </Button>
          </div>
        </div>
      ) : addresses.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-soft)]">
          <EmptyState
            title="No saved addresses yet"
            description="Add a delivery address to speed up checkout next time."
            action={
              <Button onClick={openAddDialog} className="gap-2 rounded-xl px-5 py-2.5">
                <Plus className="h-4 w-4" />
                Add your first address
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5 shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {address.label || "Address"}
                    </p>
                    {address.isDefault && (
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3 w-3" />
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{address.fullName}</p>
                </div>

                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Edit address"
                    onClick={() => openEditDialog(address)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete address"
                    className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                    onClick={() => setDeleteTarget(address)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {address.address}, {address.city}, {address.country}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{address.phone}</span>
                </div>
              </div>

              {!address.isDefault && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1 w-fit rounded-lg"
                  disabled={settingDefaultId === address.id}
                  onClick={() => void handleSetDefault(address)}
                >
                  {settingDefaultId === address.id ? "Setting..." : "Set as default"}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <AddressFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingAddress(null);
        }}
        address={editingAddress}
        saving={saving}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove this address?"
        description={
          deleteTarget
            ? `"${deleteTarget.label || deleteTarget.address}" will be removed from your saved addresses.`
            : undefined
        }
        confirmLabel="Remove"
        destructive
        loading={deleting}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
