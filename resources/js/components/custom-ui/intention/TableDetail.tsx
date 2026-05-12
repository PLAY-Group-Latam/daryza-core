import { DataTable } from "@/components/data-table";
import { DataTablePagination } from "@/components/data-table-pagination";
import { Paginate } from "@/interfaces/paginate";
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import { columns } from "./columns-intention-detail";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function TableDetail({
    data: purchaseIntents,
    meta: { currentPage, perPage: pageSize, lastPage: pageCount }
}: { data: object[]; meta: Paginate }) {
    

    const [data, setData] = useState(() => [...purchaseIntents]);
    
    useEffect(() => {
        setData(purchaseIntents);
    }, [purchaseIntents]);
    const [globalFilter, setGlobalFilter] = useState('');

    useEffect(() => setData(purchaseIntents), [purchaseIntents]);

    const table = useReactTable({
        columns,
        data,
        manualPagination: true,
        pageCount,
        state: { globalFilter, pagination: { pageIndex: currentPage - 1, pageSize } },

        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

   return (
  <div className="flex flex-col space-y-4 w-full">
    <div className="rounded-lg border bg-white overflow-hidden">
      <div className="w-full overflow-x-auto">
        <DataTable table={table} />
      </div>
    </div>

    <div className="flex flex-col gap-2.5">
      <DataTablePagination
        meta={{
          current_page: currentPage,
          last_page: pageCount,
          per_page: pageSize,
        }}
        table={table}
      />
    </div>
  </div>
);
}