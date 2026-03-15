export interface Distributor {
    id: number
    region: string
    name: string
    ruc?: string
    address?: string
    email?: string
    phone?: string
    note?: string
    img_info?: string
    coords: {
        lat: number
        lng: number
    }
}