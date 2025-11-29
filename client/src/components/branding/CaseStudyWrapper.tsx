import React, { type ReactNode } from "react";
import { applyTheme } from "@/lib/color-utils";

type ThemeProps = {
  backgroundColor?: string;
  textColor?: string;
  primaryColor?: string;
};

type CaseStudyWrapperProps = {
  theme?: ThemeProps;
  className?: string;
  children: ReactNode;
};

export function CaseStudyWrapper({
  theme,
  className = "",
  children,
}: CaseStudyWrapperProps) {
  const style = applyTheme(theme);

  return (
    <div
      className={`case-study-root ${className}`}
      style={style}
      data-theme-applied={Boolean(theme)}
    >
      {children}
    </div>
  );
}

