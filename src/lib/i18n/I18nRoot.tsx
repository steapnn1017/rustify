"use client";

import { I18nProvider } from "./I18nProvider";
import type { ReactNode } from "react";

export function I18nRoot({ children }: { children: ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}
