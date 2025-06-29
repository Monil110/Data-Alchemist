// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function parseCommaSeparated(value: string | null | undefined): string[] {
  if (!value) return [];
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

export function parsePhaseRange(value: string | null | undefined): number[] {
  if (!value) return [];
  
  // Handle range format like "1-3"
  if (value.includes('-')) {
    const parts = value.split('-').map(num => num.trim());
    if (parts.length === 2 && parts[0] && parts[1]) {
      const start = parseInt(parts[0]);
      const end = parseInt(parts[1]);
      if (!isNaN(start) && !isNaN(end)) {
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
      }
    }
  }
  
  // Handle array format like "[1,3,5]" or "1,3,5"
  const cleaned = value.replace(/[\[\]]/g, '');
  return parseCommaSeparated(cleaned).map(Number).filter(num => !isNaN(num));
}

export function parseJSON(value: string | null | undefined): Record<string, any> {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}