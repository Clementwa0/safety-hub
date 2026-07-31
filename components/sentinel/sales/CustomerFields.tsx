"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Customer } from "@/types/sales";

interface CustomerFieldsProps {
  value: Customer;
  onChange: (customer: Customer) => void;
  errors?: Partial<Record<keyof Customer, string>>;
}

export function CustomerFields({ value, onChange, errors }: CustomerFieldsProps) {
  const set = <K extends keyof Customer>(key: K, next: Customer[K]) =>
    onChange({ ...value, [key]: next });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="customer-name">Customer name</Label>
        <Input
          id="customer-name"
          value={value.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Jane Doe"
          aria-invalid={Boolean(errors?.name)}
        />
        {errors?.name ? (
          <p className="text-xs text-destructive">{errors.name}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="customer-company">Company (optional)</Label>
        <Input
          id="customer-company"
          value={value.company ?? ""}
          onChange={(e) => set("company", e.target.value)}
          placeholder="Acme Ltd"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customer-email">Email (optional)</Label>
        <Input
          id="customer-email"
          type="email"
          value={value.email ?? ""}
          onChange={(e) => set("email", e.target.value)}
          placeholder="jane@acme.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customer-phone">Phone (optional)</Label>
        <Input
          id="customer-phone"
          value={value.phone ?? ""}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="+254 700 000 000"
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="customer-address">Address (optional)</Label>
        <Textarea
          id="customer-address"
          rows={2}
          value={value.address ?? ""}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Street, city, country"
        />
      </div>
    </div>
  );
}

export default CustomerFields;
