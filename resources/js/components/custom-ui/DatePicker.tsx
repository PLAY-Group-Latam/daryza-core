'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

import { formatDate } from '@/lib/helpers/formatDate';
import { CalendarIcon } from 'lucide-react';

import * as React from 'react';

interface DatePickerProps {
    value?: Date;
    onChange: (date?: Date) => void;
    placeholder?: string;
}

export function DatePicker({
    value,
    onChange,
    placeholder = 'Seleccionar fecha',
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="flex w-full items-center justify-between font-normal"
                >
                    <span className={value ? '' : 'text-muted-foreground'}>
                        {value ? formatDate(value) : placeholder}
                    </span>

                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={value}
                    defaultMonth={value}
                    onSelect={(date) => {
                        onChange(date);
                        setOpen(false);
                    }}
                    captionLayout="dropdown"
                />
            </PopoverContent>
        </Popover>
    );
}
