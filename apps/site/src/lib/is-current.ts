/** The exact path, or a `/`-separated prefix (`/components/forms` is inside `/components`; `/components-old` is not). */
export const isCurrent = (pathname: string, href: string) =>
  href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
