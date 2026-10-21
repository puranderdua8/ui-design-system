// Safari on macOS only Tabs to form controls by default; links and buttons need Option+Tab
// (the "Press Tab to highlight each item" setting is off). Playwright's WebKit follows that on
// macOS but not on Linux, where CI runs. Everywhere else this is plain Tab.
export const tabKey = (browserName: string): string =>
  browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
