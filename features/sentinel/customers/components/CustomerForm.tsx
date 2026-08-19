"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { customerService } from "@/services/sentinel/customer.service";
import type { Customer, CustomerInput } from "@/types/sentinel/customer";
import { cn } from "@/lib/utils";

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
  onSaved?: () => void;
}

const EMPTY: CustomerInput = {
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
};

export default function CustomerForm({
  open,
  onOpenChange,
  customer,
  onSaved,
}: CustomerFormProps) {
  const [values, setValues] = useState<CustomerInput>(EMPTY);
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Reset the form whenever the dialog opens for a different customer.
  const formKey = `${open ? "open" : "closed"}:${customer?.id ?? "new"}`;
  const [lastFormKey, setLastFormKey] = useState(formKey);

  if (formKey !== lastFormKey) {
    setLastFormKey(formKey);
    setValues(
      open && customer
        ? {
            name: customer.name,
            email: customer.email ?? "",
            phone: customer.phone ?? "",
            company: customer.company ?? "",
            address: customer.address ?? "",
          }
        : EMPTY,
    );
    setNameError(null);
  }

  const setField = <K extends keyof CustomerInput>(key: K, value: CustomerInput[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (key === "name") setNameError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!values.name.trim()) {
      setNameError("Customer name is required");
      return;
    }

    setSaving(true);

    try {
      if (customer) {
        await customerService.update(customer.id, values);
        toast.success("Customer updated");
      } else {
        await customerService.create(values);
        toast.success("Customer created");
      }

      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the customer");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-xl font-semibold">
            {customer ? "Edit Customer" : "New Customer"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {customer
              ? "Update this customer's contact details."
              : "Add a customer record to your CRM."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="customer-name" className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customer-name"
              value={values.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="e.g. Jane Wanjiru"
              className={cn("h-10", nameError && "border-destructive focus-visible:ring-destructive")}
              aria-invalid={Boolean(nameError)}
              disabled={saving}
              autoFocus
            />
            {nameError && <p className="text-xs text-destructive">{nameError}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="customer-email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="customer-email"
                type="email"
                value={values.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="jane@example.com"
                className="h-10"
                disabled={saving}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="customer-phone" className="text-sm font-medium">
                Phone
              </Label>
              <Input
                id="customer-phone"
                value={values.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="+254700000000"
                className="h-10"
                disabled={saving}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="customer-company" className="text-sm font-medium">
              Company
            </Label>
            <Input
              id="customer-company"
              value={values.company}
              onChange={(e) => setField("company", e.target.value)}
              placeholder="e.g. Acme Construction Ltd"
              className="h-10"
              disabled={saving}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="customer-address" className="text-sm font-medium">
              Address
            </Label>
            <Input
              id="customer-address"
              value={values.address}
              onChange={(e) => setField("address", e.target.value)}
              placeholder="Street, City"
              className="h-10"
              disabled={saving}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={saving} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {customer ? "Save changes" : "Create customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
