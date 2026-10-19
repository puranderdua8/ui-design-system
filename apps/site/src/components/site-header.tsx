import Link from "next/link";

export const SiteHeader = () => (
  <header className="border-b border-ds-border">
    <nav
      aria-label="Main"
      className="mx-auto flex w-full max-w-4xl items-center gap-6 px-4 py-4 sm:px-6"
    >
      <Link href="/" className="ds-type-label ds-focus-ring">
        Home
      </Link>
      <Link href="/components" className="ds-type-label ds-focus-ring">
        Components
      </Link>
    </nav>
  </header>
);
