// On Cloudflare Workers a socket opened while handling one request can't be used by another one:
// a database pool kept on globalThis answers the first request and then hangs every later query
// (the Worker is cancelled with "code had hung"). OpenNext puts a fresh context object on this
// global symbol for each request, so we keep one value per request there. Outside Cloudflare
// (next start, scripts, tests) the symbol is unset and one shared value is kept for the process.
const cloudflareContext = Symbol.for("__cloudflare-context__");

export function perRequest<T extends object>(name: string, create: () => T): () => T {
  const byRequest = new WeakMap<object, T>();
  const shared = globalThis as typeof globalThis & Record<string, T | undefined>;
  const key = `__perRequest_${name}`;

  return () => {
    const request = (globalThis as Record<symbol, object | undefined>)[cloudflareContext];
    if (!request) return (shared[key] ??= create());

    let value = byRequest.get(request);
    if (!value) {
      value = create();
      byRequest.set(request, value);
    }
    return value;
  };
}
