"use client";

import { useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Trash2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductFormInput } from "@/lib/validation/product";

export function DetailsSection() {
  const { control } = useFormContext<ProductFormInput>();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>Short highlights, e.g. Waterproof, Anti-slip.</CardDescription>
        </CardHeader>
        <CardContent>
          <Controller
            control={control}
            name="features"
            render={({ field }) => <FeatureList value={field.value ?? []} onChange={field.onChange} />}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
          <CardDescription>Unlimited key/value pairs, e.g. Material → PVC.</CardDescription>
        </CardHeader>
        <CardContent>
          <SpecsList />
        </CardContent>
      </Card>
    </div>
  );
}

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

  const commitEdit = () => {
    if (editingIndex === null) return;
    const trimmed = editingValue.trim();
    if (trimmed) {
      onChange(value.map((item, i) => (i === editingIndex ? trimmed : item)));
    }
    setEditingIndex(null);
    setEditingValue("");
  };

  return (
    <div className="space-y-3">
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
          placeholder="e.g. Heat Resistant"
        />
        <Button type="button" variant="outline" onClick={addFeature}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {value.length === 0 ? (
        <p className="text-sm text-muted-foreground">No features added yet.</p>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {value.map((feature, index) => (
              <motion.li
                key={`${feature}-${index}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2"
              >
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />

                {editingIndex === index ? (
                  <Input
                    autoFocus
                    value={editingValue}
                    onChange={(event) => setEditingValue(event.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        commitEdit();
                      }
                    }}
                    className="h-7"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => startEdit(index)}
                    className="flex-1 truncate text-left text-sm"
                  >
                    {feature}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="shrink-0 text-muted-foreground transition hover:text-destructive"
                  aria-label={`Remove ${feature}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

function SpecsList() {
  const { control, register } = useFormContext<ProductFormInput>();
  const { fields, append, remove } = useFieldArray({ control, name: "specs" });

  return (
    <div className="space-y-3">
      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">No specifications added yet.</p>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2"
              >
                <div className="grid flex-1 grid-cols-2 gap-2">
                  <Input
                    placeholder="Material"
                    {...register(`specs.${index}.label` as const)}
                  />
                  <Input
                    placeholder="PVC"
                    {...register(`specs.${index}.value` as const)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="shrink-0 text-muted-foreground transition hover:text-destructive"
                  aria-label="Remove specification"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
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
      >
        <Plus className="h-4 w-4" />
        Add specification
      </Button>
    </div>
  );
}

export default DetailsSection;
