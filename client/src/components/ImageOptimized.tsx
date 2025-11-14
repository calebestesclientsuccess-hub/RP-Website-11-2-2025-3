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
  // Validate alt text in development
  if (process.env.NODE_ENV === 'development') {
    if (!alt || alt.trim().length === 0) {
      console.warn(`❌ SEO Warning: Missing alt text for image: ${src}`);
    } else if (alt.length < 5) {
      console.warn(`⚠️ SEO Warning: Alt text too short (${alt.length} chars) for image: ${src}`);
    } else if (alt.length > 125) {
      console.warn(`⚠️ SEO Warning: Alt text too long (${alt.length} chars) for image: ${src}`);
    }
  }

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