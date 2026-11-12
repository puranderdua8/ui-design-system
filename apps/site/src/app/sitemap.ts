import type { MetadataRoute } from "next";
import { categories } from "@/lib/categories";
import { siteUrl } from "@/lib/site";

const sitemap = (): MetadataRoute.Sitemap =>
  ["/", "/components", ...categories.map((c) => `/components/${c.slug}`)].map(
    (path) => ({ url: `${siteUrl}${path === "/" ? "" : path}` }),
  );

export default sitemap;
