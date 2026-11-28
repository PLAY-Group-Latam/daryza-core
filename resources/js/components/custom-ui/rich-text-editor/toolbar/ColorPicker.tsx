'use client';

import type { Editor } from '@tiptap/react';
import { useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

import {
    COLOR_PALETTE,
    DEFAULT_HIGHLIGHT_COLOR,
    DEFAULT_TEXT_COLOR,
    LIGHT_COLORS,
} from '../constants';

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

interface ColorPickerProps {
    editor: Editor;
    kind: 'text' | 'highlight';
    icon: ReactNode;
    tooltip: string;
    isTriggerActive: () => boolean;
}

export function ColorPicker({
    editor,
    kind,
    icon,
    tooltip,
    isTriggerActive,
}: ColorPickerProps) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(
        kind === 'text' ? DEFAULT_TEXT_COLOR : DEFAULT_HIGHLIGHT_COLOR,
    );
    const [hexDraft, setHexDraft] = useState(selected);

    // Aplica el color directamente sobre la selección actual SIN robar el
    // foco del input (evita que Radix/Popover cierre o interfiera).
    const applyToEditor = (hex: string) => {
        if (kind === 'text') {
            editor.commands.setColor(hex);
        } else {
            editor.commands.setHighlight({ color: hex });
        }
    };

    const applyColor = (hex: string) => {
        setSelected(hex);
        setHexDraft(hex);
        applyToEditor(hex);
    };

    // Normaliza un código hex: acepta con/sin "#", 3 o 6 dígitos, minúsculas.
    const normalizeHexInput = (
        value: string,
        allowShorthand = false,
    ): string => {
        const trimmed = value.trim();
        let hex = trimmed.replace(/^#/, '');
        if (allowShorthand && /^[0-9a-fA-F]{3}$/.test(hex)) {
            hex = hex
                .split('')
                .map((char) => char + char)
                .join('');
        }
        if (/^[0-9a-fA-F]{6}$/.test(hex)) {
            return `#${hex.toLowerCase()}`;
        }
        return trimmed;
    };

    const handleHexChange = (value: string) => {
        // Aplica en vivo solo con 6 dígitos válidos (evita cambios parciales).
        const normalized = normalizeHexInput(value);
        setHexDraft(normalized);
        if (HEX_COLOR_REGEX.test(normalized)) {
            setSelected(normalized);
            applyToEditor(normalized);
        }
    };

    const handleHexCommit = () => {
        // Al confirmar (Enter/blur) permite también la forma corta de 3 dígitos.
        const normalized = normalizeHexInput(hexDraft, true);
        if (HEX_COLOR_REGEX.test(normalized)) {
            setSelected(normalized);
            setHexDraft(normalized);
            applyToEditor(normalized);
        } else {
            setHexDraft(selected);
        }
    };

    const reset = () => {
        if (kind === 'text') {
            editor.commands.unsetColor();
        } else {
            editor.commands.unsetHighlight();
        }
        setOpen(false);
    };

    const isSelected = (hex: string) =>
        kind === 'text'
            ? selected === hex
            : editor.isActive('highlight', { color: hex });

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            size="icon"
                            variant={isTriggerActive() ? 'default' : 'outline'}
                        >
                            {icon}
                        </Button>
                    </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-[260px] p-3" sideOffset={8}>
                <div className="flex flex-col gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-full justify-start gap-2 px-2 text-xs hover:bg-neutral-100"
                        onClick={reset}
                    >
                        <span className="relative block h-4 w-4 rounded-sm border border-dashed border-neutral-400 after:absolute after:top-1/2 after:left-0 after:h-[1px] after:w-full after:-rotate-45 after:bg-red-500 after:content-['']" />
                        {kind === 'text'
                            ? 'Color predeterminado'
                            : 'Sin relleno'}
                    </Button>

                    <div className="flex flex-col gap-[2px]">
                        {COLOR_PALETTE.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex gap-[2px]">
                                {row.map((hex) => (
                                    <button
                                        key={hex}
                                        type="button"
                                        onClick={() => applyColor(hex)}
                                        className="relative flex h-5 w-5 items-center justify-center rounded-[2px] border border-black/5 transition-transform hover:scale-110"
                                        style={{
                                            backgroundColor: hex,
                                        }}
                                        title={hex}
                                    >
                                        {isSelected(hex) && (
                                            <svg
                                                className="h-2.5 w-2.5"
                                                viewBox="0 0 10 10"
                                                fill="none"
                                            >
                                                <path
                                                    d="M1.5 5L4 7.5L8.5 2.5"
                                                    stroke={
                                                        LIGHT_COLORS.has(hex)
                                                            ? '#555'
                                                            : 'white'
                                                    }
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>

                    {kind === 'text' && (
                        <div className="mt-1 flex items-center justify-between gap-2 border-t border-neutral-100 pt-2">
                            <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-neutral-600 transition-colors hover:text-neutral-900">
                                <input
                                    type="color"
                                    value={
                                        HEX_COLOR_REGEX.test(selected)
                                            ? selected
                                            : DEFAULT_TEXT_COLOR
                                    }
                                    onChange={(e) => applyColor(e.target.value)}
                                    className="h-4 w-4 cursor-pointer rounded-sm border-0 bg-transparent p-0 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-[1px] [&::-webkit-color-swatch]:border-neutral-300 [&::-webkit-color-swatch-wrapper]:p-0"
                                />
                                Más colores
                            </label>
                            <div className="flex items-center gap-1">
                                <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase">
                                    HEX:
                                </span>
                                <Input
                                    type="text"
                                    value={hexDraft}
                                    onChange={(e) =>
                                        handleHexChange(e.target.value)
                                    }
                                    onBlur={handleHexCommit}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleHexCommit();
                                            e.currentTarget.blur();
                                        }
                                    }}
                                    className="h-5 w-16 border-neutral-200 bg-neutral-50 px-1 py-0 text-center font-mono text-[10px]"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
