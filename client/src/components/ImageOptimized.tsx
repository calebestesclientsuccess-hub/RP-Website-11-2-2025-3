import { ImgHTMLAttributes } from 'react';

interface ImageOptimizedProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function ImageOptimized({
  src,
  alt,
  width,
  height,
  priority = false,
  loading = 'lazy',
  decoding = 'async',
  ...props
}: ImageOptimizedProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : loading}
      decoding={decoding}
      {...props}
    />
  );
}