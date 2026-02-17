import { describe, expect, it } from "bun:test";

describe("viem-inpage", () => {
  it("should export createEip1193Provider", async () => {
    const { createEip1193Provider } = await import("./index.js");
    expect(createEip1193Provider).toBeDefined();
    expect(typeof createEip1193Provider).toBe("function");
  });

  it("should export Eip1193Provider class", async () => {
    const { Eip1193Provider } = await import("./index.js");
    expect(Eip1193Provider).toBeDefined();
    expect(typeof Eip1193Provider).toBe("function");
  });
});
