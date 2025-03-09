// @ts-expect-error
window.encodeBase64 = encodeBase64;

export function decodeBase64(b64: string): string {
  try {
    return decodeURIComponent(escape(atob(b64)));
  } catch {
    return "";
  }
}

export function encodeBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}
