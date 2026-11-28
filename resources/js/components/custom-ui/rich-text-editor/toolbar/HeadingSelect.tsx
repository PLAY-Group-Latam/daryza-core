'use client';

import type { Editor } from '@tiptap/react';
import { ChevronDown } from 'lucide-react';
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

import { HEADING_LEVELS } from '../constants';

function getHeadingLabel(editor: Editor): string {
    for (const level of HEADING_LEVELS) {
        if (editor.isActive('heading', { level })) return `Título ${level}`;
    }
    return 'Normal';
}

export function HeadingSelect({ editor }: { editor: Editor }) {
    const [open, setOpen] = useState(false);
    const label = getHeadingLabel(editor);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant={
                                editor.isActive('heading')
                                    ? 'default'
                                    : 'outline'
                            }
                            className="h-9 gap-1 px-2.5 text-xs font-medium"
                        >
                            <span>{label}</span>
                            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                        </Button>
                    </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Normal / Título</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-44 p-1.5" sideOffset={8}>
                <div className="flex flex-col gap-1">
                    <Button
                        type="button"
                        variant={
                            !editor.isActive('heading') ? 'secondary' : 'ghost'
                        }
                        size="sm"
                        className="justify-start text-xs"
                        onClick={() => {
                            editor.chain().focus().setParagraph().run();
                            setOpen(false);
                        }}
                    >
                        Normal
                    </Button>
                    {HEADING_LEVELS.map((level) => (
                        <Button
                            key={level}
                            type="button"
                            variant={
                                editor.isActive('heading', { level })
                                    ? 'secondary'
                                    : 'ghost'
                            }
                            size="sm"
                            className="justify-start text-xs font-semibold"
                            onClick={() => {
                                editor
                                    .chain()
                                    .focus()
                                    .toggleHeading({ level })
                                    .run();
                                setOpen(false);
                            }}
                        >
                            Título {level}
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
