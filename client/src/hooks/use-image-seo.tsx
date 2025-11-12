
import { validateAltText } from '../lib/seo-utils';

export function useImageSEO(alt: string, src: string) {
  const isValid = validateAltText(alt);
  
  if (!isValid && process.env.NODE_ENV === 'development') {
    console.warn(`Invalid alt text for image: ${src}. Alt text: "${alt}"`);
  }
  
  return {
    isValid,
    alt: isValid ? alt : `Image: ${src.split('/').pop()?.split('.')[0] || 'content'}`,
  };
}
