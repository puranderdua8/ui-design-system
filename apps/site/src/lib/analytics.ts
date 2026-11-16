/**
 * Removes the URL hash from an analytics event (D-144). A shared design will travel in
 * the hash, so it must never reach analytics. Works on any URL string, absolute or not.
 */
export const stripHash = <T extends { url: string }>(event: T): T => {
  const at = event.url.indexOf("#");
  return at === -1 ? event : { ...event, url: event.url.slice(0, at) };
};
