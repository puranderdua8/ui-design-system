// The Node APIs tsup.config.ts uses. This package has no @types/node (the
// source is browser code), so the config is checked against these declarations
// by tsconfig.node.json instead of widening the globals for `src`.
declare module "node:path" {
  export const sep: string;
  export function basename(path: string): string;
  export function dirname(path: string): string;
  export function resolve(...paths: string[]): string;
}
declare module "node:url" {
  export function fileURLToPath(url: string | URL): string;
}
interface ImportMeta {
  url: string;
}
