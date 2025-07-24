import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  // Base classes - common styles for all buttons
  "flex-row items-center justify-center rounded-lg transition-opacity active:opacity-80",
  {
    variants: {
      variant: {
        default: "bg-primary",
        primary: "bg-primary", // Keep compatibility with existing code
        secondary: "bg-secondary",
        outline: "bg-transparent border border-primary",
        ghost: "bg-transparent",
        destructive: "bg-error",
        success: "bg-success",
        link: "bg-transparent",
      },
      size: {
        sm: "h-9 px-3",
        default: "h-12 px-4",
        lg: "h-14 px-6",
        icon: "h-12 w-12 px-0",
        // Keep compatibility with existing code
        small: "h-9 px-3",
        medium: "h-12 px-4",
        large: "h-14 px-6",
      },
      fullWidth: {
        true: "w-full",
      },
      rounded: {
        true: "rounded-full",
      },
      shadow: {
        true: "shadow-md elevation-3",
      },
    },
    compoundVariants: [
      // Disabled state for filled variants
      {
        variant: ["default", "primary", "secondary", "destructive", "success"],
        className: "disabled:opacity-50",
      },
      // Icon button specific styles
      {
        size: "icon",
        className: "aspect-square",
      },
      // Full width + large combination
      {
        fullWidth: true,
        size: ["lg", "large"],
        className: "h-16",
      },
      // Outline variant with border
      {
        variant: "outline",
        className: "border-2",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export const buttonTextVariants = cva(
  // Base text classes
  "text-center font-semibold",
  {
    variants: {
      variant: {
        default: "text-white",
        primary: "text-white", // Keep compatibility with existing code
        secondary: "text-white",
        outline: "text-primary",
        ghost: "text-text",
        destructive: "text-white",
        success: "text-white",
        link: "text-primary",
      },
      size: {
        sm: "text-sm",
        default: "text-base",
        lg: "text-lg",
        icon: "text-base",
        // Keep compatibility with existing code
        small: "text-sm",
        medium: "text-base",
        large: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
