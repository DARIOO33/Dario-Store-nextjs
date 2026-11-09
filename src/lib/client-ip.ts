// The visitor's IP address, as told by Caddy in front of the app. Caddy replaces any
// X-Forwarded-For the visitor sends with the real address, so the first entry can be trusted.
// If Cloudflare's proxy (orange cloud) is ever turned on, every visitor would arrive from a
// Cloudflare address: then read "cf-connecting-ip" and tell Caddy to trust Cloudflare's ranges.
export function clientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || null;
}
