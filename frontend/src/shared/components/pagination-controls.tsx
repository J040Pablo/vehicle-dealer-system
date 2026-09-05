import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export interface PaginationControlsProps {
  page: number;
  totalPages: number;
  totalElements: number;
  size: number;
  onPageChange: (newPage: number) => void;
  onSizeChange: (newSize: number) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function PaginationControls({
  page,
  totalPages,
  totalElements,
  size,
  onPageChange,
  onSizeChange,
  isFirst,
  isLast,
}: PaginationControlsProps) {
  const displayTotalPages = Math.max(1, totalPages);
  const canGoPrevious = !(isFirst ?? page === 0) && page > 0;
  const canGoNext = !(isLast ?? page >= displayTotalPages - 1) && page < displayTotalPages - 1;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-3 bg-card border-t border-border/80 rounded-b-xl text-sm">
      {/* Total Elements & Page Size Selector */}
      <div className="flex items-center gap-4 text-muted-foreground text-xs sm:text-sm">
        <span>
          Total de registros: <strong className="text-foreground">{totalElements}</strong>
        </span>
        <div className="flex items-center gap-1.5">
          <span className="hidden sm:inline">Exibir:</span>
          <Select
            value={String(size)}
            onValueChange={(val) => {
              onSizeChange(Number(val));
              onPageChange(0); // reset to first page when size changes
            }}
          >
            <SelectTrigger aria-label="Selecione a quantidade de itens por página" className="h-8 w-[70px] text-xs">
              <SelectValue placeholder={String(size)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="hidden sm:inline">por página</span>
        </div>
      </div>

      {/* Navigation Buttons and Current Page Indicator */}
      <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm text-muted-foreground mr-2">
          Página <strong className="text-foreground">{page + 1}</strong> de{" "}
          <strong className="text-foreground">{displayTotalPages}</strong>
        </span>

        {/* First Page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(0)}
          disabled={!canGoPrevious}
          aria-label="Primeira página"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoPrevious}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Next Page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoNext}
          aria-label="Próxima página"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(displayTotalPages - 1)}
          disabled={!canGoNext}
          aria-label="Última página"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
