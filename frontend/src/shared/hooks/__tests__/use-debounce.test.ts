import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "../use-debounce";

describe("useDebounce", () => {
  vi.useFakeTimers();

  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 300));
    expect(result.current).toBe("initial");
  });

  it("should update debounced value after the specified delay", () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: "first", delay: 300 },
    });

    expect(result.current).toBe("first");

    // Change value
    rerender({ value: "second", delay: 300 });
    expect(result.current).toBe("first"); // should not have updated yet

    // Fast-forward timer by 299ms
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe("first");

    // Fast-forward by 1ms (total 300ms)
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("second");
  });
});
