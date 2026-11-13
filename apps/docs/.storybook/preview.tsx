import type { Decorator, Preview } from "@storybook/react-vite";
import { ThemeScope } from "@puranderdua/ui";
import base from "@puranderdua/ui/themes/base.json";
import corporate from "@puranderdua/ui/themes/corporate.json";
import nature from "@puranderdua/ui/themes/nature.json";
import quirky from "@puranderdua/ui/themes/quirky.json";
import "../src/styles.css";

// Each theme's resolved var map (D-048: apps never hand-write theme values).
const themes = { base, corporate, nature, quirky } as const;
type ThemeName = keyof typeof themes;

const isThemeName = (value: unknown): value is ThemeName =>
  typeof value === "string" && value in themes;

// Wraps every story in a ThemeScope so the theme's vars apply and portals
// (Select, later Dialog and Tooltip) render inside the theme.
const withTheme: Decorator = (Story, context) => {
  const name: ThemeName = isThemeName(context.globals.theme)
    ? context.globals.theme
    : "base";
  return (
    <ThemeScope
      theme={name}
      vars={themes[name].vars}
      style={{
        backgroundColor: "var(--ds-surface-canvas)",
        color: "var(--ds-text-primary)",
        fontFamily: "var(--ds-font-family-body)",
      }}
    >
      <Story />
    </ThemeScope>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  initialGlobals: { theme: "base" },
  globalTypes: {
    theme: {
      description: "Design-system theme",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        dynamicTitle: true,
        items: [
          { value: "base", title: "Base" },
          { value: "corporate", title: "Corporate" },
          { value: "nature", title: "Nature" },
          { value: "quirky", title: "Quirky" },
        ],
      },
    },
  },
  parameters: {
    layout: "padded",
    a11y: { test: "error" },
    viewport: {
      options: {
        narrow: {
          name: "Narrow 320px",
          styles: { width: "320px", height: "640px" },
        },
        desktop: {
          name: "Desktop 1280px",
          styles: { width: "1280px", height: "800px" },
        },
      },
    },
  },
};

export default preview;
