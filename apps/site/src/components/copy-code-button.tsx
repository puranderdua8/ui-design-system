"use client";

import { useState } from "react";
import { Button, Cluster, Text } from "@puranderdua/ui";

type CopyCodeButtonProps = {
  /** The text to put on the clipboard. */
  text: string;
  /** Names what is copied, for the accessible name: "Copy <label> code". */
  label: string;
};

export const CopyCodeButton = ({ text, label }: CopyCodeButtonProps) => {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
  };

  return (
    <Cluster gap="sm" align="center">
      <Button
        variant="secondary"
        size="sm"
        onClick={copy}
        aria-label={`Copy ${label} code`}
      >
        Copy
      </Button>
      {/* The region exists before the click, so the message is announced. */}
      <Text as="span" variant="caption" role="status">
        {state === "copied"
          ? "Copied"
          : state === "failed"
            ? "Could not copy. Select the code and copy it by hand."
            : ""}
      </Text>
    </Cluster>
  );
};
