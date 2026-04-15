'use client'

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { LocateFixed, X, Search } from 'lucide-react'
import { usePage } from '@inertiajs/react'

interface DistributorsMapProps {
    initialCoords?: { lat: number; lng: number };
    readOnly?: boolean;
    onPositionChange?: (coords: { lat: number; lng: number }) => void;
    coverageRadius?: number;
}

interface NominatimResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

interface InertiaPageProps {
    mapPin?: {
        url: string | null;
    };
    [key: string]: unknown;
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
                    border-radius: 8px;
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

function MapEvents({ readOnly, onMapClick }: { readOnly: boolean; onMapClick: (latlng: L.LatLng, skipReverse?: boolean) => void }) {
    useMapEvents({
        click(e) {
            if (readOnly) return;
            // Al hacer clic en el mapa, queremos que SÍ busque la dirección
            onMapClick(e.latlng, false); 
        },
    });
    return null;
}

export default function DistributorsMap({
    initialCoords,
    readOnly = false,
    onPositionChange,
    coverageRadius = 1500
}: DistributorsMapProps) {
    const { mapPin } = usePage<InertiaPageProps>().props;
    const [isManualSelection, setIsManualSelection] = useState(false);
    const [position, setPosition] = useState<L.LatLng | null>(null)
    const [search, setSearch] = useState<string>('')
    const [results, setResults] = useState<NominatimResult[]>([])
    const [isSearching, setIsSearching] = useState<boolean>(false)
    const [showDropdown, setShowDropdown] = useState<boolean>(false)
    const [flyTarget, setFlyTarget] = useState<L.LatLng | null>(null)

    const searchRef = useRef<HTMLDivElement>(null)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (initialCoords) {
            const newPos = new L.LatLng(initialCoords.lat, initialCoords.lng);
            setPosition(newPos);
            setFlyTarget(newPos);
        }
    }, [initialCoords?.lat, initialCoords?.lng]);

    const markerIcon = useMemo(() => createDynamicIcon(mapPin?.url ?? null), [mapPin?.url]);

    const fetchAddressFromCoords = async (lat: number, lng: number) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await res.json();
            if (data.display_name) {
                const shortAddress = data.display_name.split(',').slice(0, 3).join(',');
                setSearch(shortAddress);
            }
        } catch (error) {
            console.error("Error obteniendo dirección:", error);
        }
    }

   const updatePosition = (latlng: L.LatLng, skipReverse = false) => {
    setPosition(latlng);
    if (onPositionChange) {
        onPositionChange({ lat: latlng.lat, lng: latlng.lng });
    }
    
    // Solo busca la dirección si NO es una selección manual y no es de solo lectura
    if (!readOnly && !skipReverse) {
        fetchAddressFromCoords(latlng.lat, latlng.lng);
    }
}

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Tu navegador no soporta geolocalización.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const currentPos = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
                updatePosition(currentPos);
                setFlyTarget(currentPos);
            },
            (error) => {
                alert("No se pudo obtener tu ubicación. Permite el acceso e inténtalo de nuevo.");
                console.error(error);
            }
        );
    }

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
    const newPos = new L.LatLng(parseFloat(result.lat), parseFloat(result.lon));
    
    // Pasamos 'true' para que NO ejecute fetchAddressFromCoords
    updatePosition(newPos, true); 
    
    setFlyTarget(newPos);
    setSearch(result.display_name.split(',').slice(0, 3).join(','));
    setShowDropdown(false);
};

    const clearSearch = () => {
        setSearch('');
        setResults([]);
        setShowDropdown(false);
    }

    return (
        <div className="relative h-full w-full">
            <div className="absolute inset-0 z-[1000] pointer-events-none">
                {!readOnly && (
                    <>
                        <div ref={searchRef} className="absolute top-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-4 w-[calc(100%-2rem)] sm:w-72 lg:w-96 pointer-events-auto">
                            <div className="flex items-center gap-2 bg-white rounded-xl shadow-xl px-3 py-2.5 border border-slate-200 transition-all focus-within:ring-2 focus-within:ring-[#44AC34]/20 focus-within:border-[#44AC34]">
                                {isSearching ? (
                                    <div className="w-4 h-4 border-2 border-slate-300 border-t-[#44AC34] animate-spin rounded-full" />
                                ) : (
                                    <Search className="w-4 h-4 text-slate-400" />
                                )}
                                <input
                                    value={search}
                                    onChange={(e) => handleSearchInput(e.target.value)}
                                    onFocus={() => results.length > 0 && setShowDropdown(true)}
                                    placeholder="Buscar en el mapa..."
                                    className="flex-1 text-sm outline-none bg-transparent"
                                />
                                {search.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="p-0.5 hover:bg-slate-100 rounded-full transition-colors"
                                    >
                                        <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                                    </button>
                                )}
                            </div>
                            {showDropdown && results.length > 0 && (
                                <div className="mt-1.5 bg-white rounded-lg shadow-2xl border border-slate-100 overflow-hidden backdrop-blur-sm">
                                    {results.map((result) => (
                                        <button
                                            key={result.place_id}
                                            type="button"
                                            onClick={() => handleSelectResult(result)}
                                            className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 border-b last:border-0 transition-colors flex flex-col gap-0.5"
                                        >
                                            <span className="font-medium text-slate-700">{result.display_name.split(',')[0]}</span>
                                            <span className="text-slate-400 truncate">{result.display_name.split(',').slice(1).join(',')}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleUseCurrentLocation}
                            className="absolute top-[70px] sm:top-4 right-4 bg-white p-2.5 rounded-lg shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors pointer-events-auto group"
                            title="Usar mi ubicación actual"
                        >
                            <LocateFixed className="h-5 w-5 text-slate-600 group-hover:text-[#44AC34] transition-colors" />
                        </button>
                    </>
                )}

                <div className="absolute bottom-4 left-4 flex flex-col [&_.leaflet-control]:!m-0 [&_.leaflet-control]:pointer-events-auto [&_.leaflet-bar]:!border-none [&_.leaflet-bar]:!shadow-lg [&_.leaflet-bar_a]:!bg-white [&_.leaflet-bar_a]:!text-slate-600 [&_.leaflet-bar_a]:!border-slate-200 [&_.leaflet-bar_a]:!rounded-lg [&_.leaflet-bar_a:first-child]:!mb-1">
                    <div id="leaflet-zoom-container" />
                </div>
            </div>

            <MapContainer
                center={initialCoords ? [initialCoords.lat, initialCoords.lng] : [-12.0464, -77.0428]}
                zoom={15}
                className="h-full w-full z-0"
                zoomControl={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapEvents readOnly={readOnly} onMapClick={updatePosition} />
                <MapController targetPosition={flyTarget} />

                {position && (
                    <Marker position={position} icon={markerIcon} />
                )}

                <ZoomMover />
            </MapContainer>
        </div>
    )
}

function ZoomMover() {
    const map = useMap();
    useEffect(() => {
        const zoomControl = map.zoomControl;
        const container = document.getElementById('leaflet-zoom-container');
        if (zoomControl && container) {
            const zoomElement = zoomControl.getContainer();
            if (zoomElement) {
                container.appendChild(zoomElement);
            }
        }
    }, [map]);
    return null;
}