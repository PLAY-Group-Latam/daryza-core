 
'use client'

import React, { type FC, useState, useEffect, useRef } from 'react'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Calendar } from './calendar'

import {  Calendar as CalendaIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { es } from 'date-fns/locale'
import { format } from 'date-fns'

export interface DateRange {
  from: Date
  to: Date | undefined
}

export interface DateRangePickerProps {
  onUpdate?: (values: { range: DateRange, rangeCompare?: DateRange }) => void
  initialDateFrom?: Date | string
  initialDateTo?: Date | string
  initialCompareFrom?: Date | string
  initialCompareTo?: Date | string
  align?: 'start' | 'center' | 'end'
  locale?: string
  showCompare?: boolean
  className?: string
}

const formatDate = (date: Date, localeStr: string = 'es-PE'): string => {
  return format(date, 'LLL dd, y', { locale: es })
}

const getDateAdjustedForTimezone = (dateInput: Date | string): Date => {
  if (typeof dateInput === 'string') {
    const parts = dateInput.split('-').map((part) => parseInt(part, 10))
    // Si la fecha viene como YYYY-MM-DD
    return new Date(parts[0], parts[1] - 1, parts[2])
  }
  return new Date(dateInput)
}

interface Preset {
  name: string
  label: string
}

const PRESETS: Preset[] = [
  { name: 'today', label: 'Hoy' },
  { name: 'yesterday', label: 'Ayer' },
  { name: 'last7', label: 'Últimos 7 días' },
  { name: 'last14', label: 'Últimos 14 días' },
  { name: 'last30', label: 'Últimos 30 días' },
  { name: 'thisWeek', label: 'Esta semana' },
  { name: 'lastWeek', label: 'Semana pasada' },
  { name: 'thisMonth', label: 'Este mes' },
  { name: 'lastMonth', label: 'Mes pasado' }
]

export const DateRangePicker: FC<DateRangePickerProps> = ({
  initialDateFrom = new Date(new Date().setHours(0, 0, 0, 0)),
  initialDateTo,
  initialCompareFrom,
  initialCompareTo,
  onUpdate,
  align = 'end',
  locale = 'es-PE',
  showCompare = true,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const [range, setRange] = useState<DateRange>({
    from: getDateAdjustedForTimezone(initialDateFrom),
    to: initialDateTo
      ? getDateAdjustedForTimezone(initialDateTo)
      : getDateAdjustedForTimezone(initialDateFrom)
  })
  
  const [rangeCompare, setRangeCompare] = useState<DateRange | undefined>(
    initialCompareFrom
      ? {
          from: getDateAdjustedForTimezone(initialCompareFrom),
          to: initialCompareTo ? getDateAdjustedForTimezone(initialCompareTo) : getDateAdjustedForTimezone(initialCompareFrom)
        }
      : undefined
  )

  const openedRangeRef = useRef<DateRange | undefined>(undefined)
  const openedRangeCompareRef = useRef<DateRange | undefined>(undefined)
  const [selectedPreset, setSelectedPreset] = useState<string | undefined>(undefined)
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  useEffect(() => {
    setIsSmallScreen(window.innerWidth < 960)
    const handleResize = () => setIsSmallScreen(window.innerWidth < 960)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const getPresetRange = (presetName: string): DateRange => {
    const from = new Date()
    const to = new Date()
    from.setHours(0,0,0,0)
    to.setHours(23,59,59,999)
    const first = from.getDate() - from.getDay()

    switch (presetName) {
      case 'today': break
      case 'yesterday':
        from.setDate(from.getDate() - 1); to.setDate(to.getDate() - 1); break
      case 'last7':
        from.setDate(from.getDate() - 6); break
      case 'last14':
        from.setDate(from.getDate() - 13); break
      case 'last30':
        from.setDate(from.getDate() - 29); break
      case 'thisWeek':
        from.setDate(first); break
      case 'lastWeek':
        from.setDate(from.getDate() - 7 - from.getDay())
        to.setDate(to.getDate() - to.getDay() - 1); break
      case 'thisMonth':
        from.setDate(1); break
      case 'lastMonth':
        from.setMonth(from.getMonth() - 1); from.setDate(1)
        to.setDate(0); break
    }
    return { from, to }
  }

  const setPreset = (preset: string): void => {
    const newRange = getPresetRange(preset)
    setRange(newRange)
    if (rangeCompare) {
      setRangeCompare({
        from: new Date(newRange.from.getFullYear() - 1, newRange.from.getMonth(), newRange.from.getDate()),
        to: newRange.to ? new Date(newRange.to.getFullYear() - 1, newRange.to.getMonth(), newRange.to.getDate()) : undefined
      })
    }
  }

  const resetValues = (): void => {
    setRange({
      from: getDateAdjustedForTimezone(initialDateFrom),
      to: initialDateTo ? getDateAdjustedForTimezone(initialDateTo) : getDateAdjustedForTimezone(initialDateFrom)
    })
  }

  useEffect(() => {
    if (isOpen) {
      openedRangeRef.current = range
      openedRangeCompareRef.current = rangeCompare
    }
  }, [isOpen])

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover modal={true} open={isOpen} onOpenChange={(open) => { if (!open) resetValues(); setIsOpen(open); }}>
        <PopoverTrigger asChild>
          <Button size={'lg'} variant="outline" className="w-full justify-between text-left font-normal">
            <div className="flex items-center">
              <div className="flex flex-col">
                <span className="text-sm">
                  {formatDate(range.from, locale)} - {range.to ? formatDate(range.to, locale) : ''}
                </span>
              </div>
            </div>
            {isOpen ? <ChevronUpIcon className="ml-2" /> : <ChevronDownIcon className="ml-2" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent align={align} className="w-auto p-0">
          <div className="flex flex-col lg:flex-row">
            <div className="p-3 border-r border-border hidden lg:flex flex-col gap-1">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.name}
                  variant="ghost"
                  className="justify-start font-normal"
                  onClick={() => setPreset(preset.name)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="flex flex-col">
              <div className="p-2">
                <Calendar
                  mode="range"
                  selected={range}
                  onSelect={(val: any) => val?.from && setRange({ from: val.from, to: val.to })}
                  numberOfMonths={isSmallScreen ? 1 : 2}
                  locale={es}
                />
              </div>
              
              <div className="p-4 border-t border-border flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button onClick={() => {
                  setIsOpen(false);
                  onUpdate?.({ range, rangeCompare });
                }}>Aplicar</Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}