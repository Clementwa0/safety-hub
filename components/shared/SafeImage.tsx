"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";

import { PLACEHOLDER_IMAGE_URL } from "@/lib/image-url";

type SafeImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: ImageProps["src"] | null | undefined;
};

/**
 * Drop-in replacement for `next/image` used anywhere we render a
 * user-supplied image URL (products, categories, banners, etc.). Every image
 * in this app comes from a pasted URL rather than a managed upload, so a
 * stale/typo'd/inaccessible URL is expected to happen occasionally — this
 * component makes sure that never breaks the layout, by swapping in the
 * shared placeholder the moment the image fails to load.
 */
export function SafeImage({ src, alt, ...props }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  // A new src (e.g. switching gallery images) deserves a fresh attempt
  // rather than staying stuck on the placeholder from a previous failure.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  const resolvedSrc = !src || failed ? PLACEHOLDER_IMAGE_URL : src;

  return (
    <Image
      {...props}
      src={resolvedSrc}
      alt={alt}
      onError={() => setFailed(true)}
    />
  );
}

export default SafeImage;
