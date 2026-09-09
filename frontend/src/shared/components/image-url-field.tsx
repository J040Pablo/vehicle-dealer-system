import { useState, useEffect } from "react";
import { Image, X } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

export interface ImageUrlFieldProps {
  value?: string | null;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  fallbackIcon?: React.ComponentType<{ className?: string }>;
  error?: string;
}

export function ImageUrlField({
  value,
  onChange,
  label = "URL da Imagem",
  placeholder = "https://exemplo.com/imagem.jpg",
  description = "Opcional. Informe a URL de uma imagem para visualização.",
  disabled = false,
  fallbackIcon: FallbackIcon = Image,
  error,
}: ImageUrlFieldProps) {
  const [hasError, setHasError] = useState(false);
  const normalizedValue = value || "";

  useEffect(() => {
    setHasError(false);
  }, [normalizedValue]);

  const hasImage = normalizedValue.trim().length > 0;

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-semibold text-foreground">{label}</label>}
      <div className="flex items-start gap-3">
        {/* Preview Container */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/30 flex items-center justify-center shadow-xs">
          {hasImage && !hasError ? (
            <img
              src={normalizedValue}
              alt="Preview"
              loading="lazy"
              onError={() => setHasError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground/60">
              <FallbackIcon className="h-6 w-6" />
            </div>
          )}
        </div>

        {/* Input & Actions */}
        <div className="flex-1 space-y-1">
          <div className="relative flex items-center">
            <Input
              type="url"
              value={normalizedValue}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className="pr-8 text-xs font-mono"
            />
            {hasImage && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onChange("")}
                disabled={disabled}
                className="absolute right-1 h-6 w-6 text-muted-foreground hover:text-foreground"
                title="Remover URL da imagem"
                aria-label="Remover URL da imagem"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          {description && <p className="text-[11px] text-muted-foreground leading-normal">{description}</p>}
          {error && <p className="text-[11px] font-medium text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  );
}
