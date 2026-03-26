'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

export default function FixLeafletSize() {

    const map = useMap()

    useEffect(() => {

        const timer = setTimeout(() => {
            map.invalidateSize()
        }, 300)

        return () => clearTimeout(timer)

    }, [map])

    return null
}