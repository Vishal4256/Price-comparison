import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for class merging
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
