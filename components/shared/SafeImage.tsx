"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";

import { PLACEHOLDER_IMAGE_URL } from "@/lib/image-url";
import {
  CLOUDINARY_PRESETS,
  cloudinaryUrl,
  isCloudinaryUrl,
  type CloudinaryPreset,
  type CloudinaryTransformOptions,
} from "@/lib/cloudinary";

type SafeImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: ImageProps["src"] | null | undefined;
  /**
   * Named delivery preset for Cloudinary-hosted images (card, categoryCard,
   * productGallery, banner, ...). Cloudinary then does the resize + format
   * negotiation and the Next.js optimizer is bypassed for that image.
   * Ignored for non-Cloudinary URLs, which keep the previous behaviour.
   */
  preset?: CloudinaryPreset;
  /** One-off overrides on top of the preset (rarely needed). */
  transform?: CloudinaryTransformOptions;
};

/**
 * Every image in the app goes through here. Two jobs:
 *   1. Fall back to the local placeholder when a URL is missing or broken.
 *   2. Route Cloudinary URLs through f_auto/q_auto + a per-slot width so we
 *      never ship a 4MB original into a 320px card.
 */
export function SafeImage({ src, alt, preset, transform, ...props }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return <Image {...props} src={PLACEHOLDER_IMAGE_URL} alt={alt} />;
  }

  const isCloudinary = typeof src === "string" && isCloudinaryUrl(src);

  if (isCloudinary) {
    const options: CloudinaryTransformOptions = {
      ...(preset ? CLOUDINARY_PRESETS[preset] : {}),
      ...transform,
    };

    // Without a preset, derive a sensible width from the layout width so the
    // delivered file still matches the slot it renders into.
    if (!options.width && typeof props.width === "number") {
      options.width = props.width * 2;
    }

    return (
      <Image
        {...props}
        src={cloudinaryUrl(src, options)}
        alt={alt}
        // Cloudinary already resized/optimised; double-optimising just adds latency.
        unoptimized
        onError={() => setFailed(true)}
      />
    );
  }

  return <Image {...props} src={src} alt={alt} onError={() => setFailed(true)} />;
}

export default SafeImage;
