"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";

import { PLACEHOLDER_IMAGE_URL } from "@/lib/image-url";

type SafeImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: ImageProps["src"] | null | undefined;
};

export function SafeImage({ src, alt, ...props }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

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
