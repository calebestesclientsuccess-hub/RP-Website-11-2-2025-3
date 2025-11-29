import * as React from "react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  placeholderSrc?: string;
  alt: string;
  aspectRatio?: string;
  objectFit?: "cover" | "contain" | "fill";
}

export function ProgressiveImage({
  src,
  placeholderSrc,
  alt,
  aspectRatio,
  objectFit = "cover",
  className,
  ...props
}: ProgressiveImageProps) {
  const [imgSrc, setImgSrc] = useState(placeholderSrc || src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImgSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          aspectRatio && `aspect-[${aspectRatio}]`,
          className
        )}
        role="img"
        aria-label={alt}
      >
        <span className="text-sm">Image failed to load</span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-background", aspectRatio && `aspect-[${aspectRatio}]`)}>
      <img
        src={imgSrc}
        alt={alt}
        className={cn(
          "w-full h-full transition-all duration-500",
          objectFit === "cover" && "object-cover",
          objectFit === "contain" && "object-contain",
          objectFit === "fill" && "object-fill",
          isLoading && placeholderSrc && "blur-md scale-105",
          className
        )}
        loading="lazy"
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-muted/20 animate-pulse" aria-hidden="true" />
      )}
    </div>
  );
}

// Helper to generate tiny placeholder (can be integrated with image upload)
export function generateTinyPlaceholder(width: number = 10, height: number = 10): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='.5'%3E%3C/feGaussianBlur%3E%3C/filter%3E%3Crect width='${width}' height='${height}' fill='%23888' filter='url(%23b)'/%3E%3C/svg%3E`;
}