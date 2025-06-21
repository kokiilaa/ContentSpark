import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseOutline(outlineText: string): string[] {
  if (!outlineText) {
    return [];
  }
  return outlineText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && /^(?:[*-]|\d+\.)/.test(line))
    .map(line => line.replace(/^(?:[*-]|\d+\.)\s*/, '').trim())
    .filter(line => line.length > 0);
}
