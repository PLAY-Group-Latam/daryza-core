'use client';

import type { Editor } from '@tiptap/react';
import { Table as TableIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

const GRID_ROWS = 10;
const GRID_COLS = 10;

export function TableMenu({ editor }: { editor: Editor }) {
    const [open, setOpen] = useState(false);
    const [gridSize, setGridSize] = useState({ rows: 0, cols: 0 });

    const insertTable = (rows: number, cols: number) => {
        editor.commands.insertTable({ rows, cols, withHeaderRow: true });
        setGridSize({ rows: 0, cols: 0 });
        setOpen(false);
        editor.commands.focus();
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                        <Button type="button" size="icon" variant="outline">
                            <TableIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Insertar tabla</TooltipContent>
            </Tooltip>

            <PopoverContent className="w-auto p-2" sideOffset={8}>
                <div className="flex flex-col items-center gap-2 py-1">
                    <span className="text-xs font-medium text-neutral-600">
                        {gridSize.rows > 0 && gridSize.cols > 0
                            ? `Tabla ${gridSize.rows} × ${gridSize.cols}`
                            : 'Insertar tabla'}
                    </span>
                    <div
                        className="grid grid-cols-10 gap-1"
                        onMouseLeave={() => setGridSize({ rows: 0, cols: 0 })}
                    >
                        {Array.from({
                            length: GRID_ROWS * GRID_COLS,
                        }).map((_, index) => {
                            const row = Math.floor(index / GRID_COLS);
                            const col = index % GRID_COLS;
                            const active =
                                row < gridSize.rows && col < gridSize.cols;
                            return (
                                <button
                                    key={index}
                                    type="button"
                                    aria-label={`Insertar tabla ${row + 1} × ${col + 1}`}
                                    onMouseEnter={() =>
                                        setGridSize({
                                            rows: row + 1,
                                            cols: col + 1,
                                        })
                                    }
                                    onClick={() =>
                                        insertTable(row + 1, col + 1)
                                    }
                                    className={`h-4 w-4 rounded-[2px] border transition-colors ${
                                        active
                                            ? 'border-blue-500 bg-blue-200'
                                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                                    }`}
                                />
                            );
                        })}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
