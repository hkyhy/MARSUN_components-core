import React, { createContext, useContext } from 'react';

export type FilterLayoutContextValue = {
  isMobile: boolean;
};

const FilterLayoutContext = createContext<FilterLayoutContextValue>({ isMobile: false });

export function FilterLayoutProvider({
  isMobile,
  children,
}: {
  isMobile: boolean;
  children: React.ReactNode;
}) {
  return (
    <FilterLayoutContext.Provider value={{ isMobile }}>{children}</FilterLayoutContext.Provider>
  );
}

export function useFilterLayout() {
  return useContext(FilterLayoutContext);
}
