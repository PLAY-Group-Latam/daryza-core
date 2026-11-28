'use client';

import type { Editor } from '@tiptap/react';
import { Link as LinkIcon, Unlink } from 'lucide-react';
import { useState } from 'react';

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

export function LinkButton({ editor }: { editor: Editor }) {
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState('');

    const apply = () => {
        if (!url.trim()) return;

        editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: url.trim() })
            .run();
        setUrl('');
        setOpen(false);
    };

    return (
        <Popover
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                if (next) {
                    setUrl(editor.getAttributes('link').href ?? '');
                }
            }}
        >
            <Tooltip>
                <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            size="icon"
                            variant={
                                editor.isActive('link') ? 'default' : 'outline'
                            }
                        >
                            <LinkIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Enlace</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-64 p-3" sideOffset={8}>
                <div className="flex flex-col gap-2">
                    <Input
                        placeholder="https://ejemplo.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            className="flex-1"
                            onClick={apply}
                        >
                            Aplicar enlace
                        </Button>
                        {editor.isActive('link') && (
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={() => {
                                    editor.chain().focus().unsetLink().run();
                                    setUrl('');
                                    setOpen(false);
                                }}
                            >
                                <Unlink className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
