"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Customer } from "@/types/sentinel/sales";

interface CustomerFieldsProps {
  value: Customer;
  onChange: (customer: Customer) => void;
  errors?: Partial<Record<keyof Customer, string>>;
}

export function CustomerFields({ value, onChange, errors }: CustomerFieldsProps) {
  const set = <K extends keyof Customer>(key: K, next: Customer[K]) =>
    onChange({ ...value, [key]: next });

  return (
    <div className="rounded-xl border border-border/60 bg-white p-5 shadow-sm dark:bg-gray-950">
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Customer name */}
        <div className="space-y-1.5">
          <Label htmlFor="customer-name" className="text-xs font-medium text-muted-foreground">
            Customer name
          </Label>
          <Input
            id="customer-name"
            value={value.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Jane Doe"
            className="h-9 border-0 bg-muted/50 shadow-none focus:ring-1"
            aria-invalid={Boolean(errors?.name)}
          />
          {errors?.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Company */}
        <div className="space-y-1.5">
          <Label htmlFor="customer-company" className="text-xs font-medium text-muted-foreground">
            Company <span className="font-normal text-muted-foreground/60">(optional)</span>
          </Label>
          <Input
            id="customer-company"
            value={value.company ?? ""}
            onChange={(e) => set("company", e.target.value)}
            placeholder="Acme Ltd"
            className="h-9 border-0 bg-muted/50 shadow-none focus:ring-1"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="customer-email" className="text-xs font-medium text-muted-foreground">
            Email <span className="font-normal text-muted-foreground/60">(optional)</span>
          </Label>
          <Input
            id="customer-email"
            type="email"
            value={value.email ?? ""}
            onChange={(e) => set("email", e.target.value)}
            placeholder="jane@acme.com"
            className="h-9 border-0 bg-muted/50 shadow-none focus:ring-1"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="customer-phone" className="text-xs font-medium text-muted-foreground">
            Phone <span className="font-normal text-muted-foreground/60">(optional)</span>
          </Label>
          <Input
            id="customer-phone"
            value={value.phone ?? ""}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+254 700 000 000"
            className="h-9 border-0 bg-muted/50 shadow-none focus:ring-1"
          />
        </div>

        {/* Address – spans both columns */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="customer-address" className="text-xs font-medium text-muted-foreground">
            Address <span className="font-normal text-muted-foreground/60">(optional)</span>
          </Label>
          <Textarea
            id="customer-address"
            rows={2}
            value={value.address ?? ""}
            onChange={(e) => set("address", e.target.value)}
            placeholder="Street, city, country"
            className="border-0 bg-muted/50 shadow-none focus:ring-1"
          />
        </div>
      </div>
    </div>
  );
}

export default CustomerFields;