'use client'

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { useState } from 'react'
import L from 'leaflet'

function LocationSelector({ onSelect }: any) {

    const [position, setPosition] = useState<any>(null)

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

export default function SelectDistributorLocation({ onSelect }: any) {

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