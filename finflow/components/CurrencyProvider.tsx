"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSettings } from "@/lib/actions";

type CurrencyContextType = {
  currency: string;
};

const CurrencyContext = createContext<CurrencyContextType>({ currency: "INR" });

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState("INR");

  useEffect(() => {
    async function load() {
      const s = await getSettings();
      if (s?.currency) {
        setCurrency(s.currency);
      }
    }
    load();
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
