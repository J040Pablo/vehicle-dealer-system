import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ImageUrlField } from "../image-url-field";
import { Car } from "lucide-react";

describe("ImageUrlField Component", () => {
  it("renders placeholder fallback icon when value is empty", () => {
    render(<ImageUrlField value="" onChange={() => {}} fallbackIcon={Car} />);
    expect(screen.getByPlaceholderText("https://exemplo.com/imagem.jpg")).toBeInTheDocument();
  });

  it("renders image preview when valid image URL is provided", () => {
    const validUrl = "https://example.com/car.jpg";
    render(<ImageUrlField value={validUrl} onChange={() => {}} fallbackIcon={Car} />);
    const img = screen.getByAltText("Preview") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe(validUrl);
  });

  it("calls onChange when typing new URL", () => {
    const handleChange = vi.fn();
    render(<ImageUrlField value="" onChange={handleChange} fallbackIcon={Car} />);
    const input = screen.getByPlaceholderText("https://exemplo.com/imagem.jpg");
    fireEvent.change(input, { target: { value: "https://example.com/new.jpg" } });
    expect(handleChange).toHaveBeenCalledWith("https://example.com/new.jpg");
  });

  it("clears URL when clear button is clicked", () => {
    const handleChange = vi.fn();
    render(<ImageUrlField value="https://example.com/car.jpg" onChange={handleChange} fallbackIcon={Car} />);
    const clearBtn = screen.getByRole("button", { name: /remover url/i });
    fireEvent.click(clearBtn);
    expect(handleChange).toHaveBeenCalledWith("");
  });

  it("falls back to icon when image onError is triggered", () => {
    const brokenUrl = "https://example.com/broken.jpg";
    render(<ImageUrlField value={brokenUrl} onChange={() => {}} fallbackIcon={Car} />);
    const img = screen.getByAltText("Preview");
    fireEvent.error(img);
    expect(screen.queryByAltText("Preview")).not.toBeInTheDocument();
  });
});
