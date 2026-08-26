"use client";

import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Award, Box, Ruler, ShieldCheck, X } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import type { ProductFormInput } from "@/lib/validation/product";

export function AdditionalInfoSection() {
  const { control, register } =
    useFormContext<ProductFormInput>();

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <CardHeader className="px-4 py-3 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted/40">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="min-w-0">
            <CardTitle className="text-sm font-semibold">
              Additional information
            </CardTitle>

            <CardDescription className="mt-0.5 text-xs leading-relaxed">
              Optional logistics, warranty and compliance details.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-5 px-4 py-4 sm:px-5">
        {/* Logistics */}
        <div className="grid gap-3 sm:grid-cols-3">
          {/* Weight */}
          <Field
            icon={<Box className="h-3.5 w-3.5" />}
            label="Weight"
            htmlFor="weight"
            hint="e.g. 2.5 kg"
          >
            <Input
              id="weight"
              placeholder="2.5 kg"
              className="h-9 text-sm"
              {...register("weight")}
            />
          </Field>

          {/* Dimensions */}
          <Field
            icon={<Ruler className="h-3.5 w-3.5" />}
            label="Dimensions"
            htmlFor="dimensions"
            hint="e.g. 30 × 20 × 15 cm"
          >
            <Input
              id="dimensions"
              placeholder="30 × 20 × 15 cm"
              className="h-9 text-sm"
              {...register("dimensions")}
            />
          </Field>

          {/* Warranty */}
          <Field
            icon={<ShieldCheck className="h-3.5 w-3.5" />}
            label="Warranty"
            htmlFor="warranty"
            hint="e.g. 12 months"
          >
            <Input
              id="warranty"
              placeholder="12 months"
              className="h-9 text-sm"
              {...register("warranty")}
            />
          </Field>
        </div>

        <Separator />

        {/* Certifications */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border bg-muted/40">
              <Award className="h-3.5 w-3.5 text-muted-foreground" />
            </div>

            <div>
              <p className="text-xs font-medium">
                Certifications
              </p>

              <p className="text-[11px] text-muted-foreground">
                Standards and compliance certifications.
              </p>
            </div>
          </div>

          <Controller
            control={control}
            name="certifications"
            render={({ field }) => (
              <TagInput
                value={field.value ?? []}
                onChange={field.onChange}
                placeholder="e.g. CE, ANSI Z87.1, EN ISO 20345"
              />
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Field                                                                      */
/* -------------------------------------------------------------------------- */

function Field({
  icon,
  label,
  htmlFor,
  hint,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  htmlFor: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">
          {icon}
        </span>

        <label
          htmlFor={htmlFor}
          className="text-xs font-medium"
        >
          {label}
        </label>
      </div>

      {children}

      <p className="text-[10px] text-muted-foreground">
        {hint}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Tag Input                                                                  */
/* -------------------------------------------------------------------------- */

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

    if (!value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }

    setDraft("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((item) => item !== tag));
  };

  return (
    <div className="space-y-2">
      <div
        className={[
          "flex min-h-10 flex-wrap items-center gap-1.5",
          "rounded-md border border-input bg-background px-2 py-1.5",
          "transition-colors",
          "focus-within:border-ring focus-within:ring-1 focus-within:ring-ring",
        ].join(" ")}
      >
        {value.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="h-6 gap-1 rounded-md px-2 text-[11px] font-normal"
          >
            <span className="max-w-[180px] truncate">
              {tag}
            </span>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeTag(tag)}
              className="h-4 w-4 rounded-sm p-0 text-muted-foreground hover:bg-transparent hover:text-destructive"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}

        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              commit();
              return;
            }

            if (
              event.key === "Backspace" &&
              !draft &&
              value.length > 0
            ) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={commit}
          placeholder={
            value.length === 0 ? placeholder : "Add certification..."
          }
          className="h-7 min-w-[140px] flex-1 bg-transparent px-1 text-xs outline-none placeholder:text-muted-foreground"
        />
      </div>

      <p className="text-[10px] text-muted-foreground">
        Press Enter or comma to add a certification.
      </p>
    </div>
  );
}

export default AdditionalInfoSection;