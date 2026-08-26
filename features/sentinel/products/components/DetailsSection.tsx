"use client";

import { useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ListChecks,
  Plus,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import type { ProductFormInput } from "@/lib/validation/product";

export function DetailsSection() {
  const { control } = useFormContext<ProductFormInput>();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Features */}
      <Card className="overflow-hidden">
        <CardHeader className="px-4 py-3 sm:px-5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted/40">
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="min-w-0">
              <CardTitle className="text-sm font-semibold">
                Features
              </CardTitle>

              <CardDescription className="mt-0.5 text-xs leading-relaxed">
                Add short product highlights customers should know.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="px-4 py-4 sm:px-5">
          <Controller
            control={control}
            name="features"
            render={({ field }) => (
              <FeatureList
                value={field.value ?? []}
                onChange={field.onChange}
              />
            )}
          />
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card className="overflow-hidden">
        <CardHeader className="px-4 py-3 sm:px-5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted/40">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="min-w-0">
              <CardTitle className="text-sm font-semibold">
                Specifications
              </CardTitle>

              <CardDescription className="mt-0.5 text-xs leading-relaxed">
                Add technical properties and their values.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="px-4 py-4 sm:px-5">
          <SpecsList />
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Features                                                                   */
/* -------------------------------------------------------------------------- */

function FeatureList({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const addFeature = () => {
    const trimmed = draft.trim();

    if (!trimmed) return;

    onChange([...value, trimmed]);
    setDraft("");
  };

  const removeFeature = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(value[index]);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  const commitEdit = () => {
    if (editingIndex === null) return;

    const trimmed = editingValue.trim();

    if (trimmed) {
      onChange(
        value.map((item, index) =>
          index === editingIndex ? trimmed : item,
        ),
      );
    }

    cancelEdit();
  };

  return (
    <div className="space-y-3">
      {/* Add feature */}
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addFeature();
            }
          }}
          placeholder="e.g. Heat resistant"
          className="h-9 min-w-0 text-sm"
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addFeature}
          className="h-9 shrink-0 px-3"
        >
          <Plus className="h-3.5 w-3.5 sm:mr-1.5" />
          <span className="hidden sm:inline">Add</span>
        </Button>
      </div>

      {/* Feature count */}
      {value.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Product highlights
          </span>

          <Badge variant="secondary" className="h-5 px-2 text-[10px]">
            {value.length}
          </Badge>
        </div>
      )}

      {/* Feature list */}
      {value.length === 0 ? (
        <div className="flex min-h-20 items-center justify-center rounded-md border border-dashed bg-muted/10 px-3">
          <p className="text-xs text-muted-foreground">
            No features added yet.
          </p>
        </div>
      ) : (
        <ul className="space-y-1.5">
          <AnimatePresence initial={false}>
            {value.map((feature, index) => (
              <motion.li
                key={`${feature}-${index}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex min-h-9 items-center gap-2 rounded-md border bg-background px-2.5 py-1"
              >
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />

                {editingIndex === index ? (
                  <Input
                    autoFocus
                    value={editingValue}
                    onChange={(event) =>
                      setEditingValue(event.target.value)
                    }
                    onBlur={commitEdit}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        commitEdit();
                      }

                      if (event.key === "Escape") {
                        cancelEdit();
                      }
                    }}
                    className="h-7 min-w-0 flex-1 text-xs"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => startEdit(index)}
                    className="min-w-0 flex-1 truncate text-left text-xs hover:underline"
                    title="Click to edit"
                  >
                    {feature}
                  </button>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFeature(index)}
                  className="h-7 w-7 shrink-0 text-red-500 hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Remove ${feature}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {value.length > 0 && (
        <p className="text-[10px] text-muted-foreground">
          Click a feature to edit it.
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Specifications                                                             */
/* -------------------------------------------------------------------------- */

function SpecsList() {
  const { control, register } =
    useFormContext<ProductFormInput>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "specs",
  });

  return (
    <div className="space-y-3">
      {fields.length === 0 ? (
        <div className="flex min-h-20 items-center justify-center rounded-md border border-dashed bg-muted/10 px-3">
          <p className="text-xs text-muted-foreground">
            No specifications added yet.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {/* Desktop labels */}
          <div className="hidden grid-cols-[1fr_1fr_32px] gap-2 px-1 sm:grid">
            <span className="text-[10px] font-medium text-muted-foreground">
              Property
            </span>

            <span className="text-[10px] font-medium text-muted-foreground">
              Value
            </span>

            <span />
          </div>

          <AnimatePresence initial={false}>
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_32px] items-center gap-2"
              >
                <Input
                  placeholder="Material"
                  className="h-9 min-w-0 text-xs"
                  {...register(`specs.${index}.label` as const)}
                />

                <Input
                  placeholder="PVC"
                  className="h-9 min-w-0 text-xs"
                  {...register(`specs.${index}.value` as const)}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="h-8 w-8 text-red-500 hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Remove specification ${index + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ label: "", value: "" })}
        className="h-8 w-full gap-1.5 text-xs sm:w-auto"
      >
        <Plus className="h-3.5 w-3.5" />
        Add specification
      </Button>
    </div>
  );
}

export default DetailsSection;