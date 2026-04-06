'use client'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import { useState, useEffect } from 'react'
import L, { LatLng } from 'leaflet'
import 'leaflet/dist/leaflet.css'

const customIcon = L.icon({
    iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
})

interface MapEventsHandlerProps {
    onSelect: (coords: LatLng) => void
}

function MapEventsHandler({ onSelect }: MapEventsHandlerProps) {
    const map = useMap()

    useMapEvents({
        click(e) {
            map.flyTo(e.latlng, 14, { duration: 1.5 })
            onSelect(e.latlng)
        },
    })

    useEffect(() => {
        setTimeout(() => { map.invalidateSize() }, 100)
    }, [map])

    return null
}

export default function DistributorsMap() {
    const [position, setPosition] = useState<LatLng | null>(null)
    const [openForm, setOpenForm] = useState<boolean>(false)

    return (
        <div className="relative h-[700px] w-full overflow-hidden rounded-2xl border-4 border-white shadow-2xl">

            <div className="absolute left-1/2 top-6 z-[1000] -translate-x-1/2">
                <div className="flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-4 py-2 shadow-xl border border-slate-200 animate-bounce">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600"></div>
                    <p className="text-xs font-bold text-slate-700">
                        Haz click en el mapa para ubicar un local
                    </p>
                </div>
            </div>

            <MapContainer
                center={[-12.0464, -77.0428]}
                zoom={6}
                scrollWheelZoom
                className="h-full w-full"
            >
                <TileLayer
                    attribution="© CartoDB"
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                <MapEventsHandler onSelect={(coords: LatLng) => {
                    setPosition(coords)
                    setTimeout(() => setOpenForm(true), 1600)
                }} />

                {position && (
                    <Marker position={position} icon={customIcon} />
                )}
            </MapContainer>

        </div>
    )
}