import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Static class strings only: Tailwind scans for literals.
const roles = [
  { name: "display", cls: "ds-type-display" },
  { name: "h1", cls: "ds-type-h1" },
  { name: "h2", cls: "ds-type-h2" },
  { name: "h3", cls: "ds-type-h3" },
  { name: "body", cls: "ds-type-body" },
  { name: "lead", cls: "ds-type-lead" },
  { name: "caption", cls: "ds-type-caption" },
  { name: "label", cls: "ds-type-label" },
] as const;

const utilityRoles = [
  { name: "display", cls: "font-ds-heading text-ds-display" },
  { name: "h1", cls: "font-ds-heading text-ds-h1" },
  { name: "h2", cls: "font-ds-heading text-ds-h2" },
  { name: "h3", cls: "font-ds-heading text-ds-h3" },
  { name: "body", cls: "font-ds-body text-ds-body" },
  { name: "lead", cls: "font-ds-body text-ds-lead" },
  { name: "caption", cls: "font-ds-body text-ds-caption" },
  { name: "label", cls: "font-ds-body text-ds-label" },
] as const;

const buttons = [
  {
    name: "primary sm",
    cls: "ds-focus-ring h-ds-control-sm px-ds-control-px-sm rounded-ds-control font-ds-body text-ds-control-sm bg-ds-primary text-ds-primary-fg hover:bg-ds-primary-hover active:bg-ds-primary-active",
  },
  {
    name: "primary md",
    cls: "ds-focus-ring h-ds-control-md px-ds-control-px-md rounded-ds-control font-ds-body text-ds-control-md bg-ds-primary text-ds-primary-fg hover:bg-ds-primary-hover active:bg-ds-primary-active",
  },
  {
    name: "secondary sm",
    cls: "ds-focus-ring h-ds-control-sm px-ds-control-px-sm rounded-ds-control border border-ds-secondary-border font-ds-body text-ds-control-sm bg-ds-secondary text-ds-secondary-fg hover:bg-ds-secondary-hover active:bg-ds-secondary-active",
  },
  {
    name: "secondary md",
    cls: "ds-focus-ring h-ds-control-md px-ds-control-px-md rounded-ds-control border border-ds-secondary-border font-ds-body text-ds-control-md bg-ds-secondary text-ds-secondary-fg hover:bg-ds-secondary-hover active:bg-ds-secondary-active",
  },
  {
    name: "disabled",
    cls: "h-ds-control-md px-ds-control-px-md rounded-ds-control border border-ds-disabled-border font-ds-body text-ds-control-md bg-ds-disabled text-ds-disabled-fg",
  },
] as const;

function App() {
  return (
    <main className="bg-ds-canvas text-ds-text min-h-screen space-y-8 p-8">
      <section className="space-y-3">
        <h2 className="ds-type-label text-ds-text-muted">
          Recipes (.ds-type-*)
        </h2>
        {roles.map((r) => (
          <p key={r.name} className={r.cls}>
            {r.name}: The quick brown fox
          </p>
        ))}
      </section>
      <section className="space-y-3">
        <h2 className="ds-type-label text-ds-text-muted">
          Utilities (text-ds-*)
        </h2>
        {utilityRoles.map((r) => (
          <p key={r.name} className={r.cls}>
            {r.name}: The quick brown fox
          </p>
        ))}
        <p className="ds-type-caption text-ds-text-muted">muted caption</p>
        <p className="bg-ds-primary text-ds-text-inverse inline-block px-2">
          inverse on primary
        </p>
        <hr className="border-ds-border" />
      </section>
      <section className="flex flex-wrap items-center gap-4">
        {buttons.map((b) => (
          <button
            key={b.name}
            type="button"
            className={b.cls}
            disabled={b.name === "disabled"}
          >
            {b.name}
          </button>
        ))}
      </section>
      <section className="space-y-3">
        <h2 className="ds-type-label text-ds-text-muted">
          S15 categories (surfaces, shape, elevation, motion, layout)
        </h2>
        <div className="flex flex-wrap gap-ds-gap-md px-ds-gutter">
          <div className="bg-ds-surface-subtle ds-border border-ds-border rounded-ds-card p-ds-gap-md">
            subtle
          </div>
          <div className="bg-ds-surface-raised shadow-ds-raised ds-transition hover:shadow-ds-overlay ease-ds-standard rounded-ds-card p-ds-gap-md">
            raised (hover for overlay shadow)
          </div>
          <div className="bg-ds-surface-inverse text-ds-text-inverse ds-transition ease-ds-emphasized rounded-ds-card p-ds-gap-md">
            inverse
          </div>
          <div className="bg-ds-surface-brand text-ds-on-brand rounded-ds-pill px-ds-gap-lg py-ds-gap-xs">
            brand pill
          </div>
          <a
            href="#top"
            className="text-ds-link hover:text-ds-link-hover ds-transition-fast"
          >
            link
          </a>
        </div>
        <div className="flex max-w-ds-md flex-col gap-ds-gap-sm">
          <input
            placeholder="input"
            className="bg-ds-input border-ds-input-border hover:border-ds-input-border-hover placeholder:text-ds-placeholder ds-border rounded-ds-control p-ds-gap-sm"
          />
          <p className="text-ds-danger-fg bg-ds-danger-bg border-ds-danger-border ds-border-strong rounded-ds-control p-ds-gap-sm">
            danger message
          </p>
          <hr className="border-ds-border-strong" />
          <hr className="border-ds-border-control" />
          <div className="bg-ds-scrim text-ds-text-inverse p-ds-gap-sm">
            scrim
          </div>
        </div>
        <div className="bg-ds-surface-subtle py-ds-section-sm">
          <div className="flex gap-ds-gap-xl">
            <div className="w-ds-sidebar">sidebar width</div>
            <div className="max-w-ds-sm">container sm</div>
            <div className="max-w-ds-lg">container lg</div>
            <div className="max-w-ds-xl">container xl</div>
          </div>
          <div className="py-ds-section-md py-ds-section-lg" />
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
