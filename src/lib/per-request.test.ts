import { afterEach, describe, expect, it } from "vitest";
import { perRequest } from "./per-request";

const contextKey = Symbol.for("__cloudflare-context__");
const global = globalThis as Record<symbol, object | undefined>;

afterEach(() => {
  delete global[contextKey];
});

describe("perRequest", () => {
  it("keeps one shared value outside Cloudflare", () => {
    const current = perRequest("test-shared", () => ({}));
    expect(current()).toBe(current());
  });

  it("[fixed] gives each Cloudflare request its own value (a shared pool hung the Worker)", () => {
    const current = perRequest("test-cf", () => ({}));

    global[contextKey] = {};
    const first = current();
    expect(current()).toBe(first);

    global[contextKey] = {};
    expect(current()).not.toBe(first);
  });
});
