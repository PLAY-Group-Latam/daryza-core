import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import { TableDetail } from "@/components/custom-ui/intention/TableDetail";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Historial de Intenciones de Compra',
        href: '/intencion-de-compra',
    },
];

export default function PurchaseIntentDetail({ paginatedEvents }: { paginatedEvents: any }) {

// ── LOGS DE DIAGNÓSTICO ──────────────────────────────
    console.log("📦 paginatedEvents completo:", JSON.stringify(paginatedEvents, null, 2));
    
    const events = paginatedEvents?.data ?? [];
    
    // Log específico por tipo de evento
    events.forEach((event: any, i: number) => {
        console.log(`\n─── Evento [${i}] ───`);
        console.log("  event_type:", event.event_type);
        console.log("  event_data (raw):", JSON.stringify(event.event_data, null, 2));
    });

    // Log solo del view_cart
    const cartEvent = events.find((e: any) => e.event_type === "view_cart");
    if (cartEvent) {
        console.log("\n🛒 VIEW_CART event_data completo:", JSON.stringify(cartEvent.event_data, null, 2));
        const d = cartEvent.event_data;
        console.log("  → items en d.cart?.items:", d?.cart?.items);
        console.log("  → items en d.data?.items:", d?.data?.items);
        console.log("  → items en d.items:", d?.items);
        console.log("  → primer item keys:", Object.keys(d?.cart?.items?.[0] ?? d?.data?.items?.[0] ?? d?.items?.[0] ?? {}));
    }

    // Log solo del wishlist
    const wishlistEvents = events.filter((e: any) => e.event_type === "wishlist_toggle");
    wishlistEvents.forEach((e: any, i: number) => {
        console.log(`\n❤️ WISHLIST [${i}] event_data:`, JSON.stringify(e.event_data, null, 2));
    });
    // ────────────────────────────────────────────────────

    const firstEvent = events[0];
    const customer = firstEvent?.customer;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Historial de Intenciones de Compra" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-0">
                <div className="flex justify-between">
                    <div className="text-lg font-bold lg:text-2xl">
                        Historial de Intenciones de Compra
                    </div>
                </div>

                <div className="flex flex-col">
                    <span>
                        {customer?.full_name ?? 'Usuario Anónimo'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        {customer?.email ?? 'Sin correo'}
                    </span>
                </div>

                <TableDetail 
                    data={paginatedEvents?.data ?? []} 
                    meta={paginatedEvents?.meta} 
                />
            </div>
        </AppLayout>
    );
}