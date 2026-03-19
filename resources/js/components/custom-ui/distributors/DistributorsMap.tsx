'use client'

import { MapContainer, TileLayer, Marker, Popup, useMapEvents,useMap } from 'react-leaflet'
import { useState, useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import DistributorForm from './DistributorForm'
import { Distributor } from '@/types/distributors/distributors'

interface DistributorsMapProps {
    initialCoords?: { lat: number; lng: number };
    readOnly?: boolean;
    distributor?: Distributor;
}

interface NominatimResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    type: string;
    class: string;
}

const customIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
})

function MapController({ targetPosition }: { targetPosition: L.LatLng | null }) {
    const map = useMap()
    useEffect(() => {
        if (targetPosition) {
            map.setView(targetPosition, 16, { animate: true })
        }
    }, [targetPosition, map])
    return null
}

function MapEvents({ readOnly, onMapClick }: { readOnly: boolean; onMapClick: (latlng: L.LatLng) => void }) {
    useMapEvents({
        click(e) {
            if (readOnly) return
            onMapClick(e.latlng)
        },
    })
    return null
}

export default function DistributorsMap({ initialCoords, readOnly = false, distributor }: DistributorsMapProps) {
    const initialPos = initialCoords ? new L.LatLng(initialCoords.lat, initialCoords.lng) : null

    const [mode, setMode] = useState<'create' | 'edit'>(distributor ? 'edit' : 'create')
    const [position, setPosition] = useState<L.LatLng | null>(initialPos)
    const [openForm, setOpenForm] = useState(false)

    const [search, setSearch] = useState('')
    const [results, setResults] = useState<NominatimResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [flyTarget, setFlyTarget] = useState<L.LatLng | null>(null)

    const searchRef = useRef<HTMLDivElement>(null)
    const debounceRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSearchInput = useCallback((value: string) => {
        setSearch(value)
        setShowDropdown(false)

        if (debounceRef.current) clearTimeout(debounceRef.current)

        if (value.trim().length < 3) {
            setResults([])
            return
        }

        debounceRef.current = setTimeout(async () => {
            setIsSearching(true)
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=6&addressdetails=1&countrycodes=pe&viewbox=-81.3,-18.4,-68.7,-0.0&bounded=1`
                )
                const data: NominatimResult[] = await res.json()
                setResults(data)
                setShowDropdown(data.length > 0)
            } catch {
                setResults([])
            } finally {
                setIsSearching(false)
            }
        }, 400)
    }, [])

    const handleSelectResult = (result: NominatimResult) => {
        const newPos = new L.LatLng(parseFloat(result.lat), parseFloat(result.lon))
        setPosition(newPos)
        setFlyTarget(newPos)
        setMode('create')
        setOpenForm(false)
        setSearch(result.display_name.split(',').slice(0, 2).join(','))
        setShowDropdown(false)
        setResults([])
    }

    const handleMapClick = (latlng: L.LatLng) => {
        setPosition(latlng)
        setOpenForm(false)
        setMode('create')
    }

    const formatName = (name: string) => {
        const parts = name.split(',').map(p => p.trim())
        return {
            main: parts.slice(0, 2).join(', '),
            secondary: parts.slice(2, 4).join(', '),
        }
    }

    return (
        <div className="relative h-[700px] w-full overflow-hidden rounded-2xl border-8 border-white bg-slate-100 shadow-2xl">

            {/* Search bar */}
            {!readOnly && (
                <div
                    ref={searchRef}
                    className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[340px] max-w-[calc(100%-2rem)]"
                >
                    {/* Input */}
                    <div className="flex items-center gap-2 bg-white rounded-xl shadow-lg px-3 py-2 border border-slate-200">
                        {isSearching ? (
                            <svg className="w-4 h-4 text-slate-400 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                        )}
                        <input
                            value={search}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            onFocus={() => results.length > 0 && setShowDropdown(true)}
                            placeholder="Buscar ubicación..."
                            className="flex-1 text-sm text-slate-700 placeholder-slate-400 bg-transparent outline-none"
                        />
                        {search && (
                            <button
                                onClick={() => { setSearch(''); setResults([]); setShowDropdown(false) }}
                                className="text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Dropdown results */}
                    {showDropdown && results.length > 0 && (
                        <div className="mt-1.5 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
                            {results.map((result, i) => {
                                const { main, secondary } = formatName(result.display_name)
                                return (
                                    <button
                                        key={result.place_id}
                                        onClick={() => handleSelectResult(result)}
                                        className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-start gap-3 ${i !== results.length - 1 ? 'border-b border-slate-50' : ''}`}
                                    >
                                        <svg className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                        </svg>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-slate-700 truncate">{main}</p>
                                            {secondary && (
                                                <p className="text-[11px] text-slate-400 truncate">{secondary}</p>
                                            )}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            <MapContainer
                center={initialPos || [-12.0464, -77.0428]}
                zoom={15}
                className="h-full w-full"
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapEvents readOnly={readOnly} onMapClick={handleMapClick} />
                <MapController targetPosition={flyTarget} />

                {position && (
                    <Marker position={position} icon={customIcon}>
                        {!readOnly && (
                            <Popup minWidth={200} closeButton={false} className="custom-popup">
                                <div className="p-2 text-center">
                                    <p className="mb-2 text-xs font-bold text-slate-700">
                                        {mode === 'edit'
                                            ? "Ubicación del distribuidor"
                                            : "Nueva ubicación seleccionada"}
                                    </p>
                                    <button
                                        onClick={() => setOpenForm(true)}
                                        className="w-full rounded-lg bg-[#44AC34] px-3 py-2 text-xs font-bold text-white shadow-md hover:bg-[#388e2a] transition-colors"
                                    >
                                        {mode === 'edit'
                                            ? "Confirmar y editar cambios"
                                            : "Confirmar y elegir Distribuidor"}
                                    </button>
                                </div>
                            </Popup>
                        )}
                    </Marker>
                )}
            </MapContainer>

            {openForm && position && (
                <DistributorForm
                    coords={position}
                    distributor={distributor}
                    mode={mode}
                    onClose={() => setOpenForm(false)}
                />
            )}
        </div>
    )
}