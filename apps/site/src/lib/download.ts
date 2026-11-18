/** Saves text as a file from the browser. Nothing leaves the page. */
export const downloadText = (name: string, mime: string, content: string) => {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
};
