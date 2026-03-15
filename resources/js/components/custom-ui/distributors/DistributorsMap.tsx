'use client'

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import { useState, useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import DistributorForm from './DistributorForm'
// --- FIX PARA EL ICONO DE LEAFLET EN NEXT.JS ---
const customIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
})

// Componente interno para manejar los eventos del mapa
function MapEvents({ onSelect }: { onSelect: (coords: L.LatLng) => void }) {
    const map = useMap()

    // Este hook reemplaza a tu antiguo MapClickHandler
    useMapEvents({
        click(e) {
            const coords = e.latlng
            // Efecto de vuelo: el mapa se desplaza y hace zoom al punto
            map.flyTo(coords, 15, {
                duration: 1.5, // segundos
                easeLinearity: 0.25
            })
            onSelect(coords)
        },
    })

    // Este useEffect reemplaza a FixLeafletSize
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize()
        }, 300)
        return () => clearTimeout(timer)
    }, [map])

    return null
}

export default function DistributorsMap() {
    const [position, setPosition] = useState<L.LatLng | null>(null)
    const [openForm, setOpenForm] = useState(false)

    const handleSelect = (coords: L.LatLng) => {
        setPosition(coords)
        // Abrimos el formulario después de que la animación de flyTo casi termine
        setTimeout(() => {
            setOpenForm(true)
        }, 1200)
    }

    return (
        <div className="relative h-[800px] w-full overflow-hidden rounded-2xl border-8 border-white bg-slate-100 shadow-2xl">

            {/* UI Overlay mejorado */}
            <div className="absolute right-6 top-6 z-[1000] flex items-center gap-3 rounded-2xl bg-white/90 p-4 shadow-xl backdrop-blur-md border border-slate-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#44AC34] text-white shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                </div>
                <div className="text-left">
                    <h3 className="text-sm font-bold text-slate-800">Módulo de Distribuidores</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Click en cualquier punto para registrar local</p>
                </div>
            </div>

            <MapContainer
                center={[-12.0464, -77.0428]}
                zoom={6}
                scrollWheelZoom
                className="h-full w-full"
            >
                {/* Capa de mapa Estilo "Voyager" (Más limpio para Dashboard) */}
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Manejador de eventos integrado */}
                <MapEvents onSelect={handleSelect} />

                {position && (
                    <Marker position={position} icon={customIcon} />
                )}
            </MapContainer>

            {/* Formulario con el campo de imagen que ya definimos */}
            {openForm && position && (
                <DistributorForm
                    coords={position}
                    onClose={() => setOpenForm(false)}
                />
            )}
        </div>
    )
}