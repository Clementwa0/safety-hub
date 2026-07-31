"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { CheckCircle2, ImageOff, Loader2, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { checkImageLoads, validateImageUrlFormat } from "@/lib/image-url";

type PreviewStatus = "idle" | "checking" | "valid" | "invalid";

interface ImageUrlInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  /** Compact renders a small square preview (good for gallery rows); default is a wide preview card. */
  size?: "default" | "compact";
  className?: string;
  disabled?: boolean;
}

/**
 * The single reusable Image URL field used across every admin form
 * (Products, Categories, Banners, Testimonials, and any future module).
 * Pastes a URL in, validates it's a well-formed HTTPS URL, then confirms it
 * actually loads before showing a live preview — never a file picker.
 */
export function ImageUrlInput({
  id,
  label = "Image URL",
  value,
  onChange,
  placeholder = "https://example.com/images/product.jpg",
  required,
  helperText,
  size = "default",
  className,
  disabled,
}: ImageUrlInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const [status, setStatus] = useState<PreviewStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const requestToken = useRef(0);

  useEffect(() => {
    const url = value.trim();

    if (!url) {
      setStatus("idle");
      setError(null);
      return;
    }

    const formatCheck = validateImageUrlFormat(url);
    if (!formatCheck.valid) {
      setStatus("invalid");
      setError(formatCheck.reason);
      return;
    }

    const token = ++requestToken.current;
    setStatus("checking");
    setError(null);

    const timer = setTimeout(() => {
      void checkImageLoads(url).then((loaded) => {
        if (requestToken.current !== token) return; // a newer URL superseded this check
        if (loaded) {
          setStatus("valid");
          setError(null);
        } else {
          setStatus("invalid");
          setError("Image could not be loaded. Check the URL is public and points to an image.");
        }
      });
    }, 350); // debounce while the admin is still typing

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <Label htmlFor={inputId}>
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
        </Label>
      ) : null}

      <div className="relative">
        <Input
          id={inputId}
          type="url"
          inputMode="url"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-invalid={status === "invalid"}
          className="pr-9"
        />
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
          {status === "checking" ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : null}
          {status === "valid" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : null}
          {status === "invalid" ? <ImageOff className="h-4 w-4 text-destructive" /> : null}
        </div>
      </div>

      {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      {value.trim() ? (
        <div
          className={cn(
            "relative overflow-hidden rounded-lg border bg-muted/40",
            size === "compact" ? "h-20 w-20" : "flex aspect-video w-full max-w-sm items-center justify-center",
          )}
        >
          {status === "checking" ? (
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : status === "valid" ? (
            <Image
              src={value.trim()}
              alt="Image preview"
              fill
              sizes={size === "compact" ? "80px" : "384px"}
              className={size === "compact" ? "object-cover" : "object-contain p-2"}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-3 text-center text-muted-foreground">
              <ImageOff className="h-5 w-5" />
              {size !== "compact" ? (
                <span className="text-xs">Image could not be loaded</span>
              ) : null}
            </div>
          )}

          <button
            type="button"
            onClick={() => onChange("")}
            disabled={disabled}
            className="absolute right-1 top-1 rounded-full bg-background/90 p-1 shadow-sm ring-1 ring-border transition hover:bg-destructive/10 hover:text-destructive"
            aria-label="Clear image URL"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default ImageUrlInput;
