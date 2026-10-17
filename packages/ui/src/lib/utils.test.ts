import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("keeps a ds colour and a ds size together", () => {
    expect(cn("text-ds-text", "text-ds-lead")).toBe(
      "text-ds-text text-ds-lead",
    );
  });

  it("lets a later ds colour replace an earlier one", () => {
    expect(cn("text-ds-text", "text-ds-primary")).toBe("text-ds-primary");
  });

  it("lets a later ds size replace a Tailwind size", () => {
    expect(cn("text-lg", "text-ds-body")).toBe("text-ds-body");
  });

  it("knows every --text-ds-<role> size in theme.css", async () => {
    // No @types/node in this package, so type the two Node bits we need locally.
    const { readFileSync } = (await import("node:fs" as string)) as {
      readFileSync: (path: string, encoding: string) => string;
    };
    const dir = (import.meta as unknown as { dirname: string }).dirname;
    const css = readFileSync(`${dir}/../styles/theme.css`, "utf8");
    const roles = [
      ...css.matchAll(/--text-(ds-[a-z0-9]+(?:-[a-z0-9]+)?):/g),
    ].map((m) => m[1]);
    for (const role of roles) {
      expect(cn("text-ds-text", `text-${role}`), role).toBe(
        `text-ds-text text-${role}`,
      );
    }
    expect(roles.length).toBeGreaterThan(0);
  });
});
