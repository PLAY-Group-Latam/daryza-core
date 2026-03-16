'use client'

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import { useState, useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import DistributorForm from './DistributorForm'
import { Distributor } from '@/types/distributors/distributors'

// --- DEFINICIÓN DE PROPS ---
interface DistributorsMapProps {
    initialCoords?: { lat: number; lng: number };
    readOnly?: boolean;
    distributor?: Distributor;
}

const customIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
})

// Componente interno para manejar los eventos del mapa
function MapEvents({ onSelect, readOnly }: { onSelect: (coords: L.LatLng) => void, readOnly: boolean }) {
    const map = useMap()

    useMapEvents({
        click(e) {
            if (readOnly) return; // Si es solo lectura, no hacemos nada al click
            
            const coords = e.latlng
            map.flyTo(coords, 15, {
                duration: 1.5,
                easeLinearity: 0.25
            })
            onSelect(coords)
        },
    })

    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize()
        }, 300)
        return () => clearTimeout(timer)
    }, [map])

    return null
}

// --- ACTUALIZACIÓN DEL COMPONENTE PRINCIPAL ---
export default function DistributorsMap({ initialCoords, readOnly = false,distributor }: DistributorsMapProps) {
    // Si hay coordenadas iniciales, las convertimos al objeto LatLng de Leaflet
    const initialPos = initialCoords ? new L.LatLng(initialCoords.lat, initialCoords.lng) : null;
    
    const [position, setPosition] = useState<L.LatLng | null>(initialPos)
    const [openForm, setOpenForm] = useState(false)

    const handleSelect = (coords: L.LatLng) => {
        setPosition(coords)
        setTimeout(() => {
            setOpenForm(true)
        }, 1200)
    }

    function MapEvents() {
        useMapEvents({
            click(e) {
                if (readOnly) return;
                setPosition(e.latlng);
                setOpenForm(false); // Cerramos el form si estaba abierto para que confirme la nueva posición
            },
        })
        return null
    }

   return (
        <div className="relative h-[700px] w-full overflow-hidden rounded-2xl border-8 border-white bg-slate-100 shadow-2xl">
            <MapContainer
                center={initialPos || [-12.0464, -77.0428]}
                zoom={15}
                className="h-full w-full"
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapEvents />

                {position && (
                    <Marker position={position} icon={customIcon}>
                        {/* ESTA ES LA OPCIÓN 3: El Popup de acción */}
                        {!readOnly && (
                            <Popup minWidth={200} closeButton={false} className="custom-popup">
                                <div className="p-2 text-center">
                                    <p className="mb-2 text-xs font-bold text-slate-700">
                                        {position.equals(initialPos!) 
                                            ? "Ubicación actual" 
                                            : "Nueva ubicación detectada"}
                                    </p>
                                    <button
                                        onClick={() => setOpenForm(true)}
                                        className="w-full rounded-lg bg-[#44AC34] px-3 py-2 text-xs font-bold text-white shadow-md hover:bg-[#388e2a] transition-colors"
                                    >
                                        Confirmar y Editar Datos
                                    </button>
                                </div>
                            </Popup>
                        )}
                    </Marker>
                )}
            </MapContainer>

            {/* El formulario solo se abre cuando dan click en el botón del Popup */}
            {openForm && position && (
                <DistributorForm
                    coords={position}
                    distributor={distributor}
                    onClose={() => setOpenForm(false)}
                />
            )}
        </div>
    )
}