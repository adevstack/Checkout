import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  siblings?: number;
}

export function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  siblings = 1,
  className,
  ...props
}: PaginationProps) {
  // Calculate range of pages to show
  const range = (start: number, end: number) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, i) => start + i);
  };

  const generatePagination = () => {
    // Minimize number of buttons if there are too many pages
    const totalPageNumbers = siblings * 2 + 3; // Siblings on both sides + first + current + last

    // If total pages is less than total page numbers, just show all pages
    if (totalPages <= totalPageNumbers) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblings, 1);
    const rightSiblingIndex = Math.min(currentPage + siblings, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 1 + 2 * siblings;
      let leftRange = range(1, leftItemCount);
      return [...leftRange, -1, totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 1 + 2 * siblings;
      let rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, -1, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, -1, ...middleRange, -1, lastPageIndex];
    }

    return range(1, totalPages);
  };

  const pages = generatePagination();

  return (
    <nav
      className={cn("flex items-center justify-center space-x-2", className)}
      {...props}
    >
      <PaginationItem
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous Page</span>
      </PaginationItem>

      {pages.map((page, i) => (
        <React.Fragment key={i}>
          {page === -1 ? (
            <PaginationEllipsis />
          ) : (
            <PaginationItem
              onClick={() => onPageChange(page)}
              isActive={page === currentPage}
            >
              {page}
            </PaginationItem>
          )}
        </React.Fragment>
      ))}

      <PaginationItem
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next Page</span>
      </PaginationItem>
    </nav>
  );
}

interface PaginationItemProps extends ButtonProps {
  isActive?: boolean;
}

function PaginationItem({
  isActive,
  children,
  className,
  ...props
}: PaginationItemProps) {
  return (
    <button
      className={cn(
        buttonVariants({
          variant: isActive ? "default" : "outline",
          size: "sm",
        }),
        "h-8 w-8",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function PaginationEllipsis() {
  return (
    <div className="flex h-8 w-8 items-center justify-center">
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </div>
  );
}
