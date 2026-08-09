"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
import { addressFormSchema, EMPTY_ADDRESS_FORM, type AddressFormValues } from "@/lib/validation/address";
import type { Address } from "@/types/storefront/address";

interface AddressFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the dialog edits this address instead of creating a new one. */
  address?: Address | null;
  saving: boolean;
  onSubmit: (values: AddressFormValues) => void | Promise<void>;
}

export function AddressFormDialog({ open, onOpenChange, address, saving, onSubmit }: AddressFormDialogProps) {
  const isEditing = Boolean(address);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: EMPTY_ADDRESS_FORM,
  });

  // Reset the form to the address being edited (or a blank form for "add
  // new") every time the dialog opens, so stale values from a previous
  // open never leak in.
  useEffect(() => {
    if (!open) return;

    reset(
      address
        ? {
            label: address.label ?? "",
            fullName: address.fullName,
            phone: address.phone,
            address: address.address,
            city: address.city,
            country: address.country,
            isDefault: address.isDefault,
          }
        : EMPTY_ADDRESS_FORM,
    );
  }, [open, address, reset]);

  const isDefault = watch("isDefault");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit address" : "Add a new address"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this delivery address."
              : "Save an address so it's ready to use next time you check out."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="address-form"
          onSubmit={handleSubmit((values) => onSubmit(values))}
          className="grid gap-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="addr-label">Label (optional)</Label>
            <Input id="addr-label" placeholder="Home, Office…" {...register("label")} />
            {errors.label && <p className="text-xs text-destructive">{errors.label.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="addr-fullName">Full name</Label>
            <Input id="addr-fullName" placeholder="John Doe" {...register("fullName")} />
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="addr-phone">Phone</Label>
            <Input id="addr-phone" type="tel" placeholder="07XX XXX XXX" {...register("phone")} />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="addr-address">Address</Label>
            <Input id="addr-address" placeholder="Street, building, apartment" {...register("address")} />
            {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="addr-city">City</Label>
              <Input id="addr-city" placeholder="Nairobi" {...register("city")} />
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addr-country">Country</Label>
              <Input id="addr-country" placeholder="Kenya" {...register("country")} />
              {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
            </div>
          </div>

          <label htmlFor="addr-isDefault" className="flex cursor-pointer items-start gap-2">
            <Checkbox
              id="addr-isDefault"
              checked={Boolean(isDefault)}
              onCheckedChange={(checked) => setValue("isDefault", checked === true)}
              className="mt-0.5"
            />
            <span className="text-sm text-muted-foreground">Set as my default address</span>
          </label>
        </form>

        <DialogFooter>
          <Button variant="outline" disabled={saving} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="address-form" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isEditing ? "Save changes" : "Add address"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddressFormDialog;
