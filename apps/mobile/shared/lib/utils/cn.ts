import { clsx } from "clsx";

/**
 * Combines multiple class names into a single string.
 * Similar to `clsx` but specifically designed for NativeWind usage.
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return clsx(...classes);
}
