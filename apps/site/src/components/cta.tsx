"use client";

import { Button } from "@puranderdua/ui";

export const Cta = () => (
  <div className="flex flex-wrap gap-3">
    <Button variant="primary" onClick={() => alert("Button clicked")}>
      Get in touch
    </Button>
    <Button variant="secondary" asChild>
      <a href="#approach">Read the approach</a>
    </Button>
  </div>
);
