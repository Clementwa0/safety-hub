"use client";

import { useCallback, useRef, useState } from "react";

import { apiRequest } from "@/lib/http";
import type { CloudinaryFolderKey } from "@/lib/cloudinary";

/**
 * Signed direct-to-Cloudinary upload.
 *
 * Flow: ask our staff-gated signing route for a signature, then PUT the raw
 * file straight at Cloudinary with XHR so we get real progress events. The
 * file never passes through our own serverless functions.
 */

const MAX_BYTES = 10 * 1024 * 1024; // 10MB — plenty for product photography
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
];

interface SignaturePayload {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
  uploadUrl: string;
}

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Unsupported file type. Use JPG, PNG, WebP, AVIF, GIF or SVG.";
  }
  if (file.size > MAX_BYTES) {
    return `Image is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 10MB.`;
  }
  return null;
}

export const CLOUDINARY_ACCEPT_ATTR = ACCEPTED_TYPES.join(",");

export function useCloudinaryUpload(folder: CloudinaryFolderKey) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const cancel = useCallback(() => {
    xhrRef.current?.abort();
    xhrRef.current = null;
    setUploading(false);
    setProgress(0);
  }, []);

  const upload = useCallback(
    async (file: File): Promise<CloudinaryUploadResult | null> => {
      const fileError = validateImageFile(file);
      if (fileError) {
        setError(fileError);
        return null;
      }

      setError(null);
      setUploading(true);
      setProgress(0);

      try {
        const signature = await apiRequest<SignaturePayload>(
          "/api/uploads/cloudinary/sign",
          { method: "POST", body: JSON.stringify({ folder }) },
        );

        const form = new FormData();
        form.append("file", file);
        form.append("api_key", signature.apiKey);
        form.append("timestamp", String(signature.timestamp));
        form.append("folder", signature.folder);
        form.append("signature", signature.signature);

        const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhrRef.current = xhr;

          xhr.open("POST", signature.uploadUrl);

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              setProgress(Math.round((event.loaded / event.total) * 100));
            }
          };

          xhr.onerror = () => reject(new Error("Network error while uploading to Cloudinary"));
          xhr.onabort = () => reject(new Error("Upload cancelled"));

          xhr.onload = () => {
            let payload: Record<string, unknown> | null = null;
            try {
              payload = JSON.parse(xhr.responseText);
            } catch {
              payload = null;
            }

            if (xhr.status < 200 || xhr.status >= 300) {
              const message =
                (payload?.error as { message?: string } | undefined)?.message ??
                "Cloudinary rejected the upload";
              reject(new Error(message));
              return;
            }

            resolve({
              secureUrl: String(payload?.secure_url ?? ""),
              publicId: String(payload?.public_id ?? ""),
              width: Number(payload?.width ?? 0),
              height: Number(payload?.height ?? 0),
              bytes: Number(payload?.bytes ?? 0),
              format: String(payload?.format ?? ""),
            });
          };

          xhr.send(form);
        });

        setProgress(100);
        return result;
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
        return null;
      } finally {
        xhrRef.current = null;
        setUploading(false);
      }
    },
    [folder],
  );

  return { upload, cancel, uploading, progress, error, setError };
}

export default useCloudinaryUpload;
