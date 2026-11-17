"use client";

import { useMemo, useSyncExternalStore } from "react";
import { evaluateContrast } from "@/playground/contrast";
import { contrastSpec, themeMaps } from "@/playground/data";
import { previewVars, safeResolve } from "@/playground/state";
import {
  getServerView,
  getView,
  subscribe,
  type StoreView,
} from "@/playground/store";

const noopSubscribe = () => () => {};

/**
 * The open project, resolved for the preview, with its readability report. The server
 * and hydration see one default project; localStorage takes over right after (the same
 * rule as the playground), and `hydrated` says when handlers are attached.
 */
export const useBuilder = () => {
  const view: StoreView = useSyncExternalStore(
    subscribe,
    getView,
    getServerView,
  );
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const { resolved, error } = useMemo(
    () => safeResolve(view.state, themeMaps),
    [view.state],
  );
  const report = useMemo(
    () => evaluateContrast(resolved.vars, contrastSpec),
    [resolved],
  );
  const vars = useMemo(() => previewVars(resolved.vars), [resolved]);
  const failing = report.results.filter((result) => !result.ok).length;
  return { view, hydrated, resolved, error, report, vars, failing };
};
