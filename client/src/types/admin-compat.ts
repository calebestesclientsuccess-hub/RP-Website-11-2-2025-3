import type { DetailedHTMLProps, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

// Loose type for input props to handle "value: string | null" issues in forms
export type LooseInputProps = Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "ref" | "value"> & {
  value?: string | number | readonly string[] | null;
};

export type LooseTextareaProps = Omit<DetailedHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>, "ref" | "value"> & {
  value?: string | number | readonly string[] | null;
};

// Patched Scene type that includes all potential properties accessed by the editor
export interface PatchedScene {
  id?: string;
  type: "fullscreen" | "split" | "gallery" | "quote" | "component" | "video" | "image" | "text" | "hero"; // Union of all used types
  zone?: string;
  
  // Common content properties
  heading?: string;
  subheadline?: string;
  body?: string;
  
  // Media properties
  mediaUrl?: string;
  mediaType?: "image" | "video";
  mediaAlt?: string;
  mediaId?: string;
  media?: string; // Sometimes accessed as just 'media'
  url?: string;   // Sometimes accessed as just 'url'
  alt?: string;   // Sometimes accessed as just 'alt'
  caption?: string;

  // Quote properties
  quote?: string;
  author?: string;
  role?: string;
  attribution?: string;

  // Gallery properties
  images?: Array<{
    url: string;
    caption?: string;
    alt?: string;
    mediaId?: string;
  }>;

  // Component/Layout properties
  layout?: string;
  overlay?: boolean;
  componentType?: string;
  props?: Record<string, any>;

  // Animation/Director properties (often accessed but missing from base type)
  director?: any; 
  animations?: any;
  
  // Catch-all for dynamic properties
  [key: string]: any; 
}

// Patched Asset type for MediaLibrary interactions
export interface PatchedAsset {
  id: string;
  url: string;
  type: string;
  title?: string;
  alt?: string;
  tags?: string[];
  [key: string]: any;
}

