import { describe, expect, it } from "vitest";
import { cn } from "../utils";

describe("cn helper", () => {
  it("should combine class names", () => {
    expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
  });

  it("should handle conditional and falsy values", () => {
    expect(cn("base", false && "hidden", null, undefined, "active")).toBe("base active");
  });

  it("should merge tailwind conflicting classes correctly", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });
});
