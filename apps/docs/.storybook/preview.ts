import type { Preview } from "@storybook/react-vite";
import "../src/styles.css";

const preview: Preview = {
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
