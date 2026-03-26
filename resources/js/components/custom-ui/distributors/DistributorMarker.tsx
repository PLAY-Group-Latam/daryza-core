import { Marker, Popup } from 'react-leaflet'
import { Distributor } from '@/types/distributors/distributors'
import DistributorPopup from './DistributorPopup'

export default function DistributorMarker({ distributor }: { distributor: Distributor }) {
    return (
        <Marker
            position={[
                distributor.coords.lat,
                distributor.coords.lng
            ]}
        >
            <Popup>
                <DistributorPopup distributor={distributor} />
            </Popup>
        </Marker>
    )
}