"use client";

import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { X } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductFormInput } from "@/lib/validation/product";

export function AdditionalInfoSection() {
  const { control, register } = useFormContext<ProductFormInput>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional information</CardTitle>
        <CardDescription>Optional logistics and compliance details.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="weight">Weight</Label>
            <Input id="weight" placeholder="2.5 kg" {...register("weight")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dimensions">Dimensions</Label>
            <Input id="dimensions" placeholder="30 x 20 x 15 cm" {...register("dimensions")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="warranty">Warranty</Label>
            <Input id="warranty" placeholder="12 months" {...register("warranty")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Certifications</Label>
          <Controller
            control={control}
            name="certifications"
            render={({ field }) => (
              <TagInput
                value={field.value ?? []}
                onChange={field.onChange}
                placeholder="EN ISO 20345, CE, ANSI Z87.1..."
              />
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (!value.includes(trimmed)) onChange([...value, trimmed]);
    setDraft("");
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 rounded-lg border border-input p-2 min-h-10">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 py-1">
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((item) => item !== tag))}
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              commit();
            } else if (event.key === "Backspace" && !draft && value.length > 0) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={commit}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <p className="text-xs text-muted-foreground">Press Enter or comma to add a tag.</p>
    </div>
  );
}

export default AdditionalInfoSection;
