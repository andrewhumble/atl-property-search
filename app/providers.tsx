"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { ConfigProvider } from "antd";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <ConfigProvider>
      <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
    </ConfigProvider>
  );
}
