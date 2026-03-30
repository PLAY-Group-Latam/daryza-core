'use client'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import { useState, useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import DistributorForm from './DistributorForm'
import FixLeafletSize from './FixLeafletSize'
import {MapPin} from 'lucide-react';

// Solución para los iconos de Leaflet que desaparecen en Next.js
const customIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
})

function MapController({ onSelect }: any) {
    const map = useMap()
    
    useMapEvents({
        click(e) {
            // Efecto FlyTo: se mueve y hace zoom al punto clickeado
            map.flyTo(e.latlng, 15, { duration: 1.5 })
            onSelect(e.latlng)
        }
    })
    return null
}

export default function DistributorsMap() {
    const [position, setPosition] = useState<any>(null)
    const [openForm, setOpenForm] = useState(false)

    function handleSelect(coords: any) {
        setPosition(coords)
        // Esperamos a que termine la animación del mapa antes de abrir el form
        setTimeout(() => setOpenForm(true), 1600)
    }

    return (
        <div className="relative h-[700px] w-full overflow-hidden rounded-2xl border-8 border-white shadow-xl bg-slate-100">
            
            {/* Flotante de instrucciones */}
            <div className="absolute left-6 top-6 z-[1000] flex items-center gap-3 rounded-2xl bg-white/90 p-4 shadow-2xl backdrop-blur-md border border-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                    <MapPin size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-800">Panel de Distribución</h3>
                    <p className="text-xs text-slate-500 text-left">Click en el mapa para ubicar un local</p>
                </div>
            </div>

            <MapContainer
                center={[-12.0464, -77.0428]}
                zoom={6}
                scrollWheelZoom
                className="h-full w-full"
            >
                <FixLeafletSize />
                
                {/* Capa de mapa estilo "Voyager" (más limpio y profesional) */}
                <TileLayer
                    attribution="© CartoDB"
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                <MapController onSelect={handleSelect} />

                {position && (
                    <Marker position={[position.lat, position.lng]} icon={customIcon} />
                )}
            </MapContainer>

            {openForm && (
                <DistributorForm
                    coords={position}
                    onClose={() => setOpenForm(false)}
                />
            )}
        </div>
    )
}