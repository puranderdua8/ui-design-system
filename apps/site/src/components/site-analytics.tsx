"use client";

import { Analytics } from "@vercel/analytics/next";
import { stripHash } from "@/lib/analytics";

// A client component because `beforeSend` is a function and cannot be passed from the
// server layout. Counts page views only: no cookies, and the URL hash is removed first.
export const SiteAnalytics = () => <Analytics beforeSend={stripHash} />;
