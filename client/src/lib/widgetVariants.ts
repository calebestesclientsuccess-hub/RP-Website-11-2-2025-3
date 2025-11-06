import { cva } from "class-variance-authority";

export const widgetVariants = cva(
  "rounded-md border",
  {
    variants: {
      theme: {
        light: "bg-white text-gray-900 border-gray-200",
        dark: "bg-gray-900 text-gray-100 border-gray-800",
        auto: ""
      },
      size: {
        small: "p-3 text-sm",
        medium: "p-4 text-base",
        large: "p-6 text-lg"
      }
    },
    defaultVariants: {
      theme: "auto",
      size: "medium"
    }
  }
);
