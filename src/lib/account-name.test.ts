import { describe, expect, it } from "vitest";
import { cleanAccountName, MAX_ACCOUNT_NAME } from "./account-name";

describe("cleanAccountName", () => {
  it("keeps a normal name", () => {
    expect(cleanAccountName("  Anouar   Aissaoui ")).toBe("Anouar Aissaoui");
    expect(cleanAccountName("أنور عيساوي")).toBe("أنور عيساوي");
  });

  it("[fixed] removes HTML tags' brackets so a name can't look like markup", () => {
    expect(cleanAccountName('<img src=x onerror="alert(1)">Bob')).toBe('img src=x onerror="alert(1)"Bob');
  });

  it("[fixed] cuts a very long name", () => {
    const name = cleanAccountName("A".repeat(5000));
    expect(name).toHaveLength(MAX_ACCOUNT_NAME);
  });

  it("does not split an emoji when cutting", () => {
    const name = cleanAccountName("😀".repeat(100));
    expect(Array.from(name)).toHaveLength(MAX_ACCOUNT_NAME);
    expect(name).toBe("😀".repeat(MAX_ACCOUNT_NAME));
  });

  it("turns line breaks and control characters into spaces", () => {
    expect(cleanAccountName("Jane\n\n\tDoe\u0000")).toBe("Jane Doe");
  });
});
