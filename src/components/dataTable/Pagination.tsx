"use client";

import { cn } from "@/lib/utils";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  isError?: boolean;
  isLoading?: boolean;
  dataLength: number;
  manualPagination?: boolean;
}

export const DataTablePagination = <TData,>({
  table,
  isError,
  isLoading,
  dataLength,
  manualPagination,
}: DataTablePaginationProps<TData>) => {
  // Don't render if there's no data, an error, or loading
  if (isError || isLoading || dataLength === 0) {
    return null;
  }

  // Don't render pagination if we have fewer rows than page size
  if (dataLength <= table.getState().pagination.pageSize) {
    return null;
  }

  return (
    <Pagination className={cn("mt-8")}>
      <PaginationContent>
        <PaginationItem>
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            variant="outline"
            className={cn("rounded", "disabled:bg-slate-400")}
          >
            {"previous"}
          </Button>
        </PaginationItem>

        <PaginationItem>
          <PaginationLink
            href="#"
            isActive={table.getState().pagination.pageIndex === 0}
            onClick={() => table.setPageIndex(0)}
          >
            1
          </PaginationLink>
        </PaginationItem>

        {table.getPageCount() > 2 && (
          <>
            {table.getState().pagination.pageIndex > 1 && (
              <PaginationItem>
                <div className="px-4">...</div>
              </PaginationItem>
            )}

            {table.getState().pagination.pageIndex !== 0 &&
              table.getState().pagination.pageIndex !==
                table.getPageCount() - 1 && (
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    isActive={true}
                    onClick={() =>
                      table.setPageIndex(table.getState().pagination.pageIndex)
                    }
                  >
                    {table.getState().pagination.pageIndex + 1}
                  </PaginationLink>
                </PaginationItem>
              )}

            {table.getState().pagination.pageIndex <
              table.getPageCount() - 2 && (
              <>
                <PaginationItem />
                <PaginationItem>
                  <div className="px-4">...</div>
                </PaginationItem>
              </>
            )}
          </>
        )}

        {table.getPageCount() > 1 && (
          <PaginationItem>
            <PaginationLink
              href="#"
              isActive={
                table.getState().pagination.pageIndex ===
                table.getPageCount() - 1
              }
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            >
              {table.getPageCount()}
            </PaginationLink>
          </PaginationItem>
        )}

        <PaginationItem>
          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            variant="outline"
            className={cn("rounded", "disabled:bg-slate-400")}
          >
            {"next"}
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default DataTablePagination;
