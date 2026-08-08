import type { ReactNode } from 'react';

/** Single filter field value item (kne react-filter shape). */
export type FilterValueItem = {
  name: string;
  label?: ReactNode;
  value: unknown;
  [key: string]: unknown;
};

/** Controlled filter value array. */
export type FilterValue = FilterValueItem[];
