"use client";

import { FC, useState, useEffect } from "react";
import { Switch } from "antd";
import { useTheme } from "next-themes";

import { SunFilledIcon, MoonFilledIcon } from "@/components/icons";

export interface ThemeSwitchProps {
  className?: string;
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({ className }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onChange = (checked: boolean) => {
    setTheme(checked ? "light" : "dark");
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div className={className} style={{ width: 32, height: 16 }} />;
  }

  const isLight = theme === "light";

  return (
    <Switch
      checked={isLight}
      onChange={onChange}
      checkedChildren={<SunFilledIcon size={16} />}
      unCheckedChildren={<MoonFilledIcon size={16} />}
      className={className}
      aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
    />
  );
};
