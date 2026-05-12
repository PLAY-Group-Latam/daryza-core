import { UserRound } from 'lucide-react';

import { UserAvatar } from '../UserAvatar';
import { OrderDetail } from './types';

export default function OrderCustomerCard({ order }: { order: OrderDetail }) {
    const fullName = order.customer
        ? `${order.customer.full_name} ${order.customer.full_last_name ?? ''}`.trim()
        : `${order.customer_first_name} ${order.customer_last_name}`.trim();

    const customerEmail = order.customer?.email ?? order.customer_email;
    const customerPhone = order.customer?.phone ?? order.customer_mobile_phone;
    const customerDocument =
        order.customer?.dni ?? order.customer_document_number;
    const customerDocumentType =
        order.customer?.document_type ?? order.customer_document_type ?? null;
    const customerPhoto = order.customer?.photo ?? null;
    const hasBillingInfo = Boolean(
        order.billing_ruc ||
        order.billing_social_reason ||
        order.billing_fiscal_address,
    );

    return (
        <div className="rounded-lg border p-5">
            <p className="mb-4 flex items-center gap-2 text-base font-semibold">
                <UserRound className="h-4 w-4" /> Informacion del cliente
            </p>

            <div className="flex items-start gap-3">
                <UserAvatar
                    name={fullName || 'Cliente'}
                    image={customerPhoto}
                    size="lg"
                />
                <div className="space-y-1 text-sm">
                    <p className="font-semibold">{fullName || '-'}</p>
                    <p className="text-muted-foreground">
                        {customerEmail || '-'}
                    </p>
                    <p className="text-muted-foreground">
                        {customerDocumentType
                            ? `${customerDocumentType.toUpperCase()}: `
                            : ''}
                        {customerDocument || '-'}
                    </p>
                    <p className="text-muted-foreground">
                        {customerPhone || '-'}
                    </p>

                    <div className="mt-3 space-y-1 border-t pt-3">
                        <p className="font-medium">Datos de Facturación</p>
                        {!hasBillingInfo ? (
                            <p className="text-sm text-muted-foreground">
                                No se encontró información de facturación.
                            </p>
                        ) : (
                            <>
                                {order.billing_ruc && (
                                    <p className="text-muted-foreground">
                                        RUC: {order.billing_ruc}
                                    </p>
                                )}
                                {order.billing_social_reason && (
                                    <p className="text-muted-foreground">
                                        Razon social:{' '}
                                        {order.billing_social_reason}
                                    </p>
                                )}
                                {order.billing_fiscal_address && (
                                    <p className="text-muted-foreground">
                                        Direccion fiscal:{' '}
                                        {order.billing_fiscal_address}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
