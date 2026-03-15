"use client";
import { createContext, useContext } from "react";

const Context = createContext<{ openSidebar: () => void }>({ openSidebar: () => {} });

export const SidebarContext = ({ value, children }: { value: { openSidebar: () => void }; children: React.ReactNode }) => (
  <Context.Provider value={value}>{children}</Context.Provider>
);

export const useSidebar = () => useContext(Context);
