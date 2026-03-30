'use client'

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface DistributorsMapProps {
    initialCoords?: { lat: number; lng: number };
    readOnly?: boolean;
    onPositionChange?: (coords: { lat: number; lng: number }) => void;
    logoPreviewUrl?: string | null;
}

interface NominatimResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

const createDynamicIcon = (logoUrl: string | null | undefined) => {
    const pinShapeUrl = '/images/distributors/marker-icon.svg';

    if (!logoUrl) {
        return L.icon({
            iconUrl: pinShapeUrl,
            iconSize: [38, 50],
            iconAnchor: [19, 50],
            popupAnchor: [0, -45],
        });
    }

    return L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div style="position: relative; width: 38px; height: 50px;">
                <div style="
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background-image: url('${logoUrl}');
                    background-size: cover;
                    background-position: center;
                    -webkit-mask-image: url('${pinShapeUrl}');
                    mask-image: url('${pinShapeUrl}');
                    -webkit-mask-size: contain;
                    mask-size: contain;
                    -webkit-mask-repeat: no-repeat;
                    mask-repeat: no-repeat;
                ">
                </div>
            </div>
        `,
        iconSize: [38, 50],
        iconAnchor: [19, 50],
        popupAnchor: [0, -45],
    });
};

function MapController({ targetPosition }: { targetPosition: L.LatLng | null }) {
    const map = useMap()
    useEffect(() => {
        if (targetPosition) {
            map.flyTo(targetPosition, 16, { animate: true, duration: 1.5 })
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

export default function DistributorsMap({ initialCoords, readOnly = false, onPositionChange, logoPreviewUrl }: DistributorsMapProps) {
    // Estado de la posición del marcador
    const [position, setPosition] = useState<L.LatLng | null>(null)
    const [search, setSearch] = useState('')
    const [results, setResults] = useState<NominatimResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [flyTarget, setFlyTarget] = useState<L.LatLng | null>(null)

    const searchRef = useRef<HTMLDivElement>(null)
    const debounceRef = useRef<NodeJS.Timeout | null>(null)

    // REACCIÓN A CAMBIOS EXTERNOS (Botón Restablecer)
    // Este useEffect asegura que si el padre cambia initialCoords, el pin se mueva.
    useEffect(() => {
        if (initialCoords) {
            const newPos = new L.LatLng(initialCoords.lat, initialCoords.lng);
            setPosition(newPos);
            setFlyTarget(newPos); // Mueve la cámara también
        }
    }, [initialCoords?.lat, initialCoords?.lng]);

    const markerIcon = useMemo(() => createDynamicIcon(logoPreviewUrl || null), [logoPreviewUrl]);

    const updatePosition = (latlng: L.LatLng) => {
        setPosition(latlng)
        if (onPositionChange) {
            onPositionChange({ lat: latlng.lat, lng: latlng.lng });
        }
    }

    // Cerrar dropdown de búsqueda al clickear fuera
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
        if (debounceRef.current) clearTimeout(debounceRef.current)
        if (value.trim().length < 3) {
            setResults([]); return
        }

        debounceRef.current = setTimeout(async () => {
            setIsSearching(true)
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5&countrycodes=pe`
                )
                const data = await res.json()
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
        updatePosition(newPos)
        setFlyTarget(newPos)
        setSearch(result.display_name.split(',').slice(0, 2).join(','))
        setShowDropdown(false)
    }

    return (
        <div className="relative h-full w-full">
            {!readOnly && (
                <div ref={searchRef} className="absolute top-4 left-4 z-[1000] w-72 lg:w-96">
                    <div className="flex items-center gap-2 bg-white rounded-xl shadow-xl px-3 py-2 border border-slate-200">
                        {isSearching ? (
                            <div className="w-4 h-4 border-2 border-slate-300 border-t-[#44AC34] animate-spin rounded-full" />
                        ) : (
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                        )}
                        <input
                            value={search}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            onFocus={() => results.length > 0 && setShowDropdown(true)}
                            placeholder="Buscar en el mapa..."
                            className="flex-1 text-sm outline-none bg-transparent"
                        />
                    </div>
                    {showDropdown && results.length > 0 && (
                        <div className="mt-1 bg-white rounded-lg shadow-2xl border border-slate-100 overflow-hidden">
                            {results.map((result) => (
                                <button
                                    key={result.place_id}
                                    type="button"
                                    onClick={() => handleSelectResult(result)}
                                    className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 border-b last:border-0"
                                >
                                    {result.display_name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <MapContainer
                center={initialCoords ? [initialCoords.lat, initialCoords.lng] : [-12.0464, -77.0428]}
                zoom={15}
                className="h-full w-full"
                zoomControl={false}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapEvents readOnly={readOnly} onMapClick={updatePosition} />
                <MapController targetPosition={flyTarget} />

                {position && <Marker position={position} icon={markerIcon} />}
            </MapContainer>
        </div>
    )
}