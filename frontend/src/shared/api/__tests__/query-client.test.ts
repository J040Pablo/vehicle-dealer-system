import { describe, expect, it } from "vitest";
import { queryClient } from "../query-client";

describe("queryClient instance", () => {
  it("should be instantiated with correct default query and mutation options", () => {
    const defaultOptions = queryClient.getDefaultOptions();

    expect(defaultOptions.queries?.staleTime).toBe(30_000);
    expect(defaultOptions.queries?.retry).toBe(1);
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false);
    expect(defaultOptions.mutations?.retry).toBe(0);
  });
});
