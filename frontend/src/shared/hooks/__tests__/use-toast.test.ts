import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToast, toast, reducer } from "../use-toast";

describe("useToast & toast helper", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Clear toasts state
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.dismiss();
    });
    act(() => {
      vi.runAllTimers();
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should add a toast and limit toasts to TOAST_LIMIT (3)", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: "Toast 1" });
      toast({ title: "Toast 2" });
      toast({ title: "Toast 3" });
      toast({ title: "Toast 4" });
    });

    expect(result.current.toasts.length).toBe(3);
    expect(result.current.toasts[0].title).toBe("Toast 4");
  });

  it("should update an existing toast", () => {
    const { result } = renderHook(() => useToast());
    let toastControls: ReturnType<typeof toast>;

    act(() => {
      toastControls = toast({ title: "Initial Title" });
    });

    expect(result.current.toasts[0].title).toBe("Initial Title");

    act(() => {
      toastControls.update({ id: toastControls.id, title: "Updated Title" });
    });

    expect(result.current.toasts[0].title).toBe("Updated Title");
  });

  it("should dismiss a single toast by id and queue removal after delay", () => {
    const { result } = renderHook(() => useToast());
    let toastControls: ReturnType<typeof toast>;

    act(() => {
      toastControls = toast({ title: "To Dismiss" });
    });

    expect(result.current.toasts[0].open).toBe(true);

    act(() => {
      toastControls.dismiss();
    });

    expect(result.current.toasts[0].open).toBe(false);

    // Fast forward 5000ms for remove timeout
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.toasts.length).toBe(0);
  });

  it("should dismiss all toasts when dismiss is called without toastId", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: "Toast A" });
      toast({ title: "Toast B" });
    });

    expect(result.current.toasts.length).toBe(2);

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.toasts.every((t) => t.open === false)).toBe(true);
  });

  it("should handle onOpenChange callback when closing a toast", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: "OpenChange Test" });
    });

    const activeToast = result.current.toasts[0];
    expect(activeToast.open).toBe(true);

    act(() => {
      activeToast.onOpenChange?.(false);
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  describe("reducer edge cases", () => {
    it("should return empty toasts array on REMOVE_TOAST without toastId", () => {
      const state = { toasts: [{ id: "1", open: true }] };
      const nextState = reducer(state as any, { type: "REMOVE_TOAST", toastId: undefined });
      expect(nextState.toasts).toEqual([]);
    });

    it("should ignore duplicate addToRemoveQueue calls for same toastId", () => {
      const state = { toasts: [{ id: "1", open: true }] };
      // Call DISMISS_TOAST twice for same toastId
      reducer(state as any, { type: "DISMISS_TOAST", toastId: "1" });
      const nextState = reducer(state as any, { type: "DISMISS_TOAST", toastId: "1" });
      expect(nextState.toasts[0].open).toBe(false);
    });
  });
});
