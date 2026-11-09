import { describe, expect, it } from "vitest";
import { recentCounter } from "./recent-counter";

const HOUR = 60 * 60 * 1000;

describe("recentCounter", () => {
  it("allows up to max events per key in the window", () => {
    const counter = recentCounter(HOUR);
    for (let i = 0; i < 5; i++) expect(counter.tryAdd("1.2.3.4", 5, 1000 + i)).toBe(true);
    expect(counter.tryAdd("1.2.3.4", 5, 2000)).toBe(false);
  });

  it("counts each key on its own", () => {
    const counter = recentCounter(HOUR);
    for (let i = 0; i < 5; i++) counter.tryAdd("1.2.3.4", 5, 1000);
    expect(counter.tryAdd("5.6.7.8", 5, 1000)).toBe(true);
  });

  it("allows again once the oldest event is older than the window", () => {
    const counter = recentCounter(HOUR);
    for (let i = 0; i < 5; i++) counter.tryAdd("1.2.3.4", 5, 1000);
    expect(counter.tryAdd("1.2.3.4", 5, 1000 + HOUR - 1)).toBe(false);
    expect(counter.tryAdd("1.2.3.4", 5, 1000 + HOUR)).toBe(true);
  });
});
