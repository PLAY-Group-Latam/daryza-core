'use client'

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { useState } from 'react'
import L, { LatLng } from 'leaflet'

interface LocationSelectorProps {
    onSelect: (coords: LatLng) => void
}

function LocationSelector({ onSelect }: LocationSelectorProps) {
    const [position, setPosition] = useState<LatLng | null>(null)

    useMapEvents({
        click(e) {
            setPosition(e.latlng)
            onSelect(e.latlng)
        }
    })

    return position ? (
        <Marker position={position} icon={L.icon({
            iconUrl: '/marker-icon.png',
            shadowUrl: '/marker-shadow.png'
        })} />
    ) : null
}

interface SelectDistributorLocationProps {
    onSelect: (coords: LatLng) => void
}

export default function SelectDistributorLocation({ onSelect }: SelectDistributorLocationProps) {
    return (
        <MapContainer
            center={[-12.0464, -77.0428]}
            zoom={12}
            className="h-[500px] w-full rounded-xl"
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationSelector onSelect={onSelect} />
        </MapContainer>
    )
}