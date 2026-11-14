/** Sanitizer HTML minimal untuk deskripsi "Kisah Kami" (pengganti util `h.z`). */
export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return "";
  const escaped = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`).join("");
}
