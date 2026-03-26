import { Distributor } from '@/types/distributors/distributors'

export default function DistributorPopup({ distributor }: { distributor: Distributor }) {
    return (
        <div className="min-w-[220px] space-y-2">

            <div className="font-semibold">
                {distributor.name}
            </div>

            {distributor.address && (
                <div className="text-xs text-gray-600">
                    {distributor.address}
                </div>
            )}

            {distributor.phone && (
                <div className="text-xs">
                    📞 {distributor.phone}
                </div>
            )}

            {distributor.email && (
                <div className="text-xs">
                    ✉ {distributor.email}
                </div>
            )}

            {distributor.note && (
                <div className="text-xs italic text-gray-500">
                    {distributor.note}
                </div>
            )}
        </div>
    )
}