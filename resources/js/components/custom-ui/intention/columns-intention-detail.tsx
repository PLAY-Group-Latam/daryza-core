import { ItemType } from "@/lib/helpers/ItemTypes";
import { parseSoles } from "@/lib/helpers/parseSoles";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const normalizeEventData = (eventType: string, raw: any) => {
  const data = typeof raw === "string" ? JSON.parse(raw) : raw;

  switch (eventType) {
    case "view_cart":
      return {
        type: "cart",
        items: data?.data?.items ?? data?.cart?.items ?? [],
        price: data?.data?.subtotal ?? data?.cart?.price ?? 0,
      };

    case "add_to_cart":
    case "product_view":
      return {
        type: "product",
        product: data?.product ?? null,
      };

    case "remove_from_cart":
    case "update_cart":
      return {
        type: "cart_action",
        item_id:  data?.item_id,
        quantity: data?.quantity ?? null,
      };

    case "wishlist_toggle":
      return {
        type:    "wishlist",
        action:  data?.data?.action ?? inferWishlistAction(data?.message ?? ""),
        message: data?.message ?? "",
        product: data?.product ?? null,
      };

    case "coupon_attempt":
      return {
        type:     "coupon",
        code:     data?.code     ?? "",
        success:  data?.success  ?? false,
        message:  data?.message  ?? "",
        discount: data?.discount ?? null,
        kind:     data?.type     ?? null,
      };

    case "order_placed":
    case "checkout_validate":
      return { type: "order", order: data?.data ?? data };

    case "order_cancelled":
      return {
        type:     "order_cancelled",
        order_id: data?.order_id,
        reason:   data?.reason  ?? "",
        message:  data?.message ?? "",
      };

    case "payment_result_success":
      return { type: "payment", payment: data?.data ?? data };

    case "voucher_upload":
      return {
        type:     "voucher",
        order_id: data?.order_id,
        message:  data?.message ?? "",
      };

    default:
      return { type: "unknown", raw: data };
  }
};

// Infiere la acción de wishlist desde el mensaje cuando no viene explícita
function inferWishlistAction(message: string): "added" | "removed" | null {
  const lower = message.toLowerCase();
  if (lower.includes("guardado") || lower.includes("agregado") || lower.includes("añadido")) {
    return "added";
  }
  if (lower.includes("eliminado") || lower.includes("quitado") || lower.includes("removido")) {
    return "removed";
  }
  return null;
}

const EVENT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  view_cart:             { label: "Ver carrito",         color: "text-blue-600 bg-blue-50" },
  add_to_cart:           { label: "Agregar al carrito",  color: "text-green-600 bg-green-50" },
  remove_from_cart:      { label: "Quitar del carrito",  color: "text-orange-500 bg-orange-50" },
  update_cart:           { label: "Actualizar carrito",  color: "text-yellow-600 bg-yellow-50" },
  clear_cart:            { label: "Vaciar carrito",      color: "text-red-500 bg-red-50" },
  product_view:          { label: "Ver producto",        color: "text-purple-600 bg-purple-50" },
  coupon_attempt:        { label: "Cupón",               color: "text-amber-600 bg-amber-50" },
  wishlist_toggle:       { label: "Favoritos",           color: "text-pink-600 bg-pink-50" },
  checkout_validate:     { label: "Inicio de checkout",  color: "text-indigo-600 bg-indigo-50" },
  order_placed:          { label: "Orden realizada",     color: "text-green-700 bg-green-50" },
  order_cancelled:       { label: "Orden cancelada",     color: "text-red-600 bg-red-50" },
  voucher_upload:        { label: "Voucher subido",      color: "text-teal-600 bg-teal-50" },
  payment_result_success:{ label: "Pago confirmado",     color: "text-emerald-600 bg-emerald-50" },
};

export const columns: ColumnDef<any>[] = [
  // ── 1. FECHA Y HORA ──────────────────────────────────────
  {
    accessorKey: "created_at",
    header: "Fecha y hora",
    cell: ({ getValue }) => {
      const val = getValue<string>();
      if (!val) return <span className="text-muted-foreground text-xs">—</span>;
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {format(new Date(val), "dd MMM yyyy", { locale: es })}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(val), "hh:mm a", { locale: es })}
          </span>
        </div>
      );
    },
  },

  // ── 2. TIPO DE EVENTO ────────────────────────────────────
  {
    accessorKey: "event_type",
    header: "Tipo de evento",
    cell: ({ getValue }) => {
      const val = getValue<string>();
      const entry = EVENT_TYPE_LABELS[val];
      return (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${entry?.color ?? "text-gray-500 bg-gray-100"}`}>
          {entry?.label ?? val}
        </span>
      );
    },
  },

  // ── 3. DATOS RELACIONADOS ────────────────────────────────
  {
    accessorKey: "event_data",
    header: "Acción realizada",
    cell: ({ row }) => {
      const eventType = row.getValue<string>("event_type");
      const rawData   = row.getValue<any>("event_data");

      if (!rawData) return <span className="text-xs text-muted-foreground italic">Sin detalles</span>;

      const event = normalizeEventData(eventType, rawData);

      // 🟢 CART
     if (event.type === "cart") {
  if (!event.items?.length) {
    return <span className="text-sm text-muted-foreground">Carrito vacío</span>;
  }
  return (
    <div className="flex flex-col gap-1">
      {event.items.map((item: any, index: number) => (
        <div key={index} className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{item.name}</span>
            <span className="text-xs text-muted-foreground">
              {item.quantity} x {parseSoles(item.unit_price ?? item.price ?? 0)}
            </span>
          </div>
          <span className="text-sm font-medium text-right">
            {parseSoles(item.line_total ?? item.priceTotal ?? 0)}
          </span>
        </div>
      ))}
      <div className="text-xs font-bold text-right border-t pt-1 mt-1">
        {event.items.length} productos — Total {parseSoles(event.price)}
      </div>
    </div>
  );
}

      // 🔵 PRODUCT
      if (event.type === "product" && event.product) {
        const p = event.product;
        return (
          <div className="flex flex-col">
            <span className="text-sm">
              {p.name} ({p.type === ItemType.SPECIFICATION ? `${p.size}, ${p.color}` : "Pack"})
            </span>
            <span className="text-xs text-muted-foreground">
              {p.quantity ?? 1} x {parseSoles(p.price)}
            </span>
          </div>
        );
      }

      // 🔧 CART ACTION
      if (event.type === "cart_action") {
        return (
          <span className="text-sm text-muted-foreground">
            Item #{event.item_id}
            {event.quantity != null && ` — Nueva cantidad: ${event.quantity}`}
          </span>
        );
      }

      // ❤️ WISHLIST
      if (event.type === "wishlist") {
        const label =
          event.action === "added"   ? "⭐ Agregó a favoritos" :
          event.action === "removed" ? "💔 Quitó de favoritos" :
          event.message;

        return (
          <div className="flex flex-col">
            <span className="text-sm text-pink-600 font-medium">{label}</span>
            {event.product?.name && (
              <span className="text-xs text-muted-foreground">{event.product.name}</span>
            )}
          </div>
        );
      }

      // 🟡 COUPON
      if (event.type === "coupon") {
        return (
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${event.success ? "text-green-600" : "text-amber-600"}`}>
              {event.message}
            </span>
            {event.code && (
              <span className="text-xs text-muted-foreground">
                Código: <strong>{event.code}</strong>
                {event.discount != null && ` — ${event.kind === "percentage" ? `${event.discount}%` : parseSoles(event.discount)} de descuento`}
              </span>
            )}
          </div>
        );
      }

      // 📦 ORDER
      if (event.type === "order") {
        const o = event.order;
        return (
          <div className="flex flex-col gap-0.5">
            {o?.order_code && <span className="text-sm font-medium">Orden #{o.order_code}</span>}
            {o?.total != null && <span className="text-xs text-muted-foreground">Total: {parseSoles(o.total)}</span>}
            {o?.payment_method && <span className="text-xs text-muted-foreground">Método: {o.payment_method}</span>}
          </div>
        );
      }

      // ❌ ORDER CANCELLED
      if (event.type === "order_cancelled") {
        return (
          <div className="flex flex-col">
            <span className="text-sm text-red-500 font-medium">Orden #{event.order_id} cancelada</span>
            {event.reason && <span className="text-xs text-muted-foreground">{event.reason}</span>}
          </div>
        );
      }

      // 💳 PAYMENT
      if (event.type === "payment") {
        const p = event.payment;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-green-600">
              Pago confirmado — {parseSoles(p?.amount ?? 0)}
            </span>
            {p?.order_code && <span className="text-xs text-muted-foreground">Orden #{p.order_code}</span>}
            {p?.method && <span className="text-xs text-muted-foreground">Método: {p.method}</span>}
          </div>
        );
      }

      // 🧾 VOUCHER
      if (event.type === "voucher") {
        return (
          <span className="text-sm text-teal-600">
            Voucher subido — Orden #{event.order_id}
          </span>
        );
      }

      return <span className="text-xs text-muted-foreground italic">Sin detalles</span>;
    },
  },
];