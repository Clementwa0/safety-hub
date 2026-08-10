"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { CheckCircle2, ImageOff, Loader2, Trash2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { checkImageLoads, validateImageUrlFormat } from "@/lib/image-url";
import {
  cloudinaryPresetUrl,
  cloudinaryPublicId,
  isCloudinaryConfigured,
  isCloudinaryUrl,
  type CloudinaryFolderKey,
} from "@/lib/cloudinary";
import {
  CLOUDINARY_ACCEPT_ATTR,
  useCloudinaryUpload,
} from "@/hooks/useCloudinaryUpload";

type PreviewStatus = "idle" | "checking" | "valid" | "invalid";

interface CloudinaryImageFieldProps {
  id?: string;
  label?: string;
  /** The stored image URL (Cloudinary or a legacy external URL). */
  value: string;
  onChange: (url: string) => void;
  /** Which Cloudinary folder new uploads land in. */
  folder: CloudinaryFolderKey;
  required?: boolean;
  helperText?: string;
  /** Compact renders a small square preview (gallery rows); default is a wide card. */
  size?: "default" | "compact";
  className?: string;
  disabled?: boolean;
}

/**
 * The single image field used by every admin form (Products, Categories,
 * Banners, Testimonials).
 *
 * Primary path: pick a file, it uploads straight to Cloudinary via a signed
 * request and the returned secure URL is stored. Secondary path: paste an
 * existing HTTPS URL — kept so the catalog's pre-Cloudinary images stay
 * editable and so staff can point at an external CDN when they need to.
 */
export function CloudinaryImageField({
  id,
  label = "Image",
  value,
  onChange,
  folder,
  required,
  helperText,
  size = "default",
  className,
  disabled,
}: CloudinaryImageFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestToken = useRef(0);

  const [status, setStatus] = useState<PreviewStatus>("idle");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const { upload, uploading, progress, error: uploadError, setError } = useCloudinaryUpload(folder);
  const uploadEnabled = isCloudinaryConfigured();

  // Validate/preview whatever URL is currently stored, uploaded or pasted.
  useEffect(() => {
    const url = value.trim();

    if (!url) {
      setStatus("idle");
      setUrlError(null);
      return;
    }

    const formatCheck = validateImageUrlFormat(url);
    if (!formatCheck.valid) {
      setStatus("invalid");
      setUrlError(formatCheck.reason);
      return;
    }

    // Cloudinary URLs we just created are trusted — skip the round trip.
    if (isCloudinaryUrl(url)) {
      setStatus("valid");
      setUrlError(null);
      return;
    }

    const token = ++requestToken.current;
    setStatus("checking");
    setUrlError(null);

    const timer = setTimeout(() => {
      void checkImageLoads(url).then((loaded) => {
        if (requestToken.current !== token) return;
        if (loaded) {
          setStatus("valid");
          setUrlError(null);
        } else {
          setStatus("invalid");
          setUrlError("Image could not be loaded. Check the URL is public and points to an image.");
        }
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [value]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const result = await upload(file);
    if (result?.secureUrl) {
      onChange(result.secureUrl);
      setShowUrlInput(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /**
   * Clearing the field also removes the asset from Cloudinary when we own it,
   * so replacing a product photo ten times doesn't leave nine orphans behind.
   */
  const handleClear = async () => {
    const publicId = cloudinaryPublicId(value);
    onChange("");
    setError(null);

    if (!publicId) return;

    await fetch("/api/uploads/cloudinary", {
      method: "DELETE",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ publicId }),
    }).catch(() => {
      // Best-effort cleanup: the form value is already cleared, and a stale
      // Cloudinary asset is not worth blocking the admin's save on.
    });
  };

  const previewUrl = value.trim()
    ? cloudinaryPresetUrl(value.trim(), size === "compact" ? "thumbnail" : "adminPreview")
    : "";

  const error = uploadError ?? urlError;

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <Label htmlFor={inputId}>
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
        </Label>
      ) : null}

      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept={CLOUDINARY_ACCEPT_ATTR}
        className="hidden"
        disabled={disabled || uploading}
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || uploading || !uploadEnabled}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="mr-1.5 h-3.5 w-3.5" />
          )}
          {uploading ? `Uploading ${progress}%` : value.trim() ? "Replace image" : "Upload image"}
        </Button>

        <button
          type="button"
          onClick={() => setShowUrlInput((open) => !open)}
          className="text-xs text-muted-foreground underline-offset-2 transition hover:text-foreground hover:underline"
        >
          {showUrlInput ? "Hide URL field" : "or paste a URL"}
        </button>

        {value.trim() ? (
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => void handleClear()}
            className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        ) : null}
      </div>

      {!uploadEnabled ? (
        <p className="text-xs text-amber-600">
          Cloudinary uploads are unavailable — NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set. Paste an
          image URL instead.
        </p>
      ) : null}

      {uploading ? (
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}

      {showUrlInput ? (
        <div className="relative">
          <Input
            type="url"
            inputMode="url"
            value={value}
            disabled={disabled || uploading}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://res.cloudinary.com/your-cloud/image/upload/..."
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
      ) : null}

      {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      {value.trim() ? (
        <div
          className={cn(
            "relative overflow-hidden rounded-lg border bg-muted/40",
            size === "compact"
              ? "h-20 w-20"
              : "flex aspect-video w-full max-w-sm items-center justify-center",
          )}
        >
          {status === "checking" ? (
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : status === "valid" ? (
            <Image
              src={previewUrl}
              alt="Image preview"
              fill
              unoptimized={isCloudinaryUrl(value.trim())}
              sizes={size === "compact" ? "80px" : "384px"}
              className={size === "compact" ? "object-cover" : "object-contain p-2"}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-3 text-center text-muted-foreground">
              <ImageOff className="h-5 w-5" />
              {size !== "compact" ? <span className="text-xs">Image could not be loaded</span> : null}
            </div>
          )}

          <button
            type="button"
            onClick={() => void handleClear()}
            disabled={disabled || uploading}
            className="absolute right-1 top-1 rounded-full bg-background/90 p-1 shadow-sm ring-1 ring-border transition hover:bg-destructive/10 hover:text-destructive"
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default CloudinaryImageField;
