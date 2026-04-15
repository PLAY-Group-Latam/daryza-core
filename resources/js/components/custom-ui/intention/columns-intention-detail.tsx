import { ItemType } from "@/lib/helpers/ItemTypes";
import { parseSoles } from "@/lib/helpers/parseSoles";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
// ✅ Importamos los iconos Gozus de Lucide
import { 
  Heart, 
  HeartOff, 
  ShoppingCart, 
  PlusCircle, 
  MinusCircle, 
  RefreshCw, 
  Eye, 
  Box, 
  Ticket, 
  ShoppingBag, 
  Ban, 
  CreditCard, 
  FileCheck 
} from "lucide-react";

// ✅ Función Gozu que asocia cada evento con su etiqueta y color
const getEventTypeConfig = (eventType: string): { label: string; color: string } => {
  const map: Record<string, { label: string; color: string }> = {
    view_cart:             { label: "Ver carrito",         color: "text-blue-600 bg-blue-50" },
    add_to_cart:           { label: "Agregar al carrito",  color: "text-green-600 bg-green-50" },
    remove_from_cart:      { label: "Quitar del carrito",  color: "text-orange-500 bg-orange-50" },
    update_cart:           { label: "Actualizar carrito",  color: "text-yellow-600 bg-yellow-50" },
    clear_cart:            { label: "Vaciar carrito",      color: "text-red-500 bg-red-50" },
    product_view:          { label: "Ver producto",        color: "text-purple-600 bg-purple-50" },
    pack_view:             { label: "Ver pack",            color: "text-purple-700 bg-purple-100" },
    coupon_attempt:        { label: "Cupón",               color: "text-amber-600 bg-amber-50" },
    wishlist_toggle:       { label: "Favoritos",           color: "text-pink-600 bg-pink-50" },
    checkout_validate:     { label: "Inicio de checkout",  color: "text-indigo-600 bg-indigo-50" },
    order_placed:          { label: "Orden realizada",     color: "text-green-700 bg-green-50" },
    order_cancelled:       { label: "Orden cancelada",     color: "text-red-600 bg-red-50" },
    voucher_upload:        { label: "Voucher subido",      color: "text-teal-600 bg-teal-50" },
    payment_result_success:{ label: "Pago confirmado",     color: "text-emerald-600 bg-emerald-50" },
  };

  return map[eventType] ?? { label: eventType, color: "text-gray-500 bg-gray-100" };
};

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
    case "pack_view":
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
        kind:      data?.type     ?? null,
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
    // 1. Normalizamos la data
    const orderData = data?.data ?? data;
    
    // 2. Intentamos buscar el total en diferentes posibles llaves
    // A veces viene como 'total', a veces como 'amount', 
    // y en Daryza a veces dentro del objeto de la orden.
    const finalAmount = orderData.total 
                     || orderData.amount 
                     || orderData.order?.total 
                     || orderData.payment?.amount 
                     || 0;

    return { 
        type: "payment", 
        payment: {
            ...orderData,
            amount: Number(finalAmount), 
            order_id: orderData.id || orderData.order_id,
            order_code: orderData.code || orderData.order_code,
            method: orderData.payment_method_type || orderData.method || orderData.payment_method,
            status: orderData.state || orderData.status
        } 
    };
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
            {format(new Date(val), "dd MMM yyyy", { locale: es })}  -  {format(new Date(val), "hh:mm a", { locale: es })}
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
      const config = getEventTypeConfig(val);
      return (
        // ✅ Badge Minimalista y Formal: Sin color de fondo pastel
        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white border ${config.color.replace('bg-', 'border-')}`}>
          {config.label}
        </span>
      );
    },
  },

  // ── 3. DATOS RELACIONADOS (Acción realizada) ────────────────────────────────
  {
    accessorKey: "event_data",
    header: "Acción realizada",
    cell: ({ row }) => {
      const eventType = row.getValue<string>("event_type");
      const rawData   = row.getValue<any>("event_data");

      if (!rawData) return <span className="text-xs text-muted-foreground italic">Sin detalles</span>;

      const event = normalizeEventData(eventType, rawData);

      // ✅ Diseño Unificado y Profesional para todas las acciones
      // Usamos Flexbox para alinear icono y texto de forma Gozu

      // 🟢 CART ACTIONS (Añadir o ver)
      if (event.type === "cart") {
        if (!event.items?.length) {
          return (
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm">Carrito vacío</span>
            </div>
          );
        }
        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-blue-600 font-medium">
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm">Ver Carrito</span>
            </div>
            {event.items.map((item: any, index: number) => (
              <div key={index} className="flex flex-col gap-0.5 ml-6 pl-1 border-l">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-xs text-muted-foreground">
                  {item.quantity} x {parseSoles(item.unit_price ?? item.price ?? 0)} — Total: {parseSoles(item.line_total ?? item.priceTotal ?? 0)}
                </span>
              </div>
            ))}
          </div>
        );
      }

      // 🔵 PRODUCT & PACK VIEWS
      if (event.type === "product" && event.product) {
        const p = event.product;
        const isPack = eventType === "pack_view" || p.type === ItemType.PACK;
        const isAdding = eventType === "add_to_cart";

        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              {/* Iconos profesionales y consistentes */}
              {isAdding ? (
                <PlusCircle className="w-4 h-4 text-green-600" />
              ) : isPack ? (
                <Box className="w-4 h-4 text-purple-600" />
              ) : (
                <Eye className="w-4 h-4 text-purple-600" />
              )}
              
              {/* Texto de la acción alineado */}
              <span className={`text-sm font-medium ${isAdding ? "text-green-600" : "text-foreground"}`}>
                {isAdding ? "Añadido al Carrito" : isPack ? "Visualizó Pack" : "Visualizó Producto"}
              </span>
            </div>

            {/* Detalles del Producto identados de forma Gozu */}
            <div className="flex flex-col gap-0.5 ml-6">
              <span className="text-sm font-medium text-muted-foreground">
                {p.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {p.quantity ?? 1} x {parseSoles(p.price)} 
                {!isPack && p.sku && p.sku !== "N/A" && ` — SKU: ${p.sku}`}
              </span>
            </div>
          </div>
        );
      }

      // ❤️ WISHLIST (Añadir o quitar de favoritos)
      if (event.type === "wishlist") {
        const isAdded = event.action === "added";
        const isRemoved = event.action === "removed";

        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              {/* Iconos de wishlist profesionales en lugar de emojis "IA" */}
              {isAdded && <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />}
              {isRemoved && <HeartOff className="w-4 h-4 text-gray-400" />}
              {!isAdded && !isRemoved && <Heart className="w-4 h-4 text-gray-400" />}
              
              <span className={`text-sm font-medium ${isAdded ? "text-pink-600" : "text-muted-foreground"}`}>
                {isAdded ? "Agregado a Favoritos" : isRemoved ? "Quitado de Favoritos" : event.message}
              </span>
            </div>
            {event.product?.name && (
              <span className="text-xs text-muted-foreground ml-6">
                {event.product.name}
              </span>
            )}
          </div>
        );
      }

      // 🔧 CART ACTIONS (Actualizar cantidad o quitar)
      if (event.type === "cart_action") {
        const isRemoving = eventType === "remove_from_cart";
        return (
          <div className="flex items-center gap-2">
            {isRemoving ? (
              <MinusCircle className="w-4 h-4 text-orange-500" />
            ) : (
              <RefreshCw className="w-4 h-4 text-yellow-600" />
            )}
            <span className="text-sm text-muted-foreground">
              Item #{event.item_id}
              {event.quantity != null && ` — Nueva cantidad: ${event.quantity}`}
            </span>
          </div>
        );
      }

      // 🎫 🟡 COUPON
      if (event.type === "coupon") {
        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Ticket className={`w-4 h-4 ${event.success ? "text-green-600" : "text-amber-600"}`} />
              <span className={`text-sm font-medium ${event.success ? "text-green-600" : "text-amber-600"}`}>
                {event.message}
              </span>
            </div>
            {event.code && (
              <span className="text-xs text-muted-foreground ml-6">
                Código: <strong>{event.code}</strong>
                {event.discount != null && ` — ${event.kind === "percentage" ? `${event.discount}%` : parseSoles(event.discount)} de descuento`}
              </span>
            )}
          </div>
        );
      }

      // 🛍️ 📦 ORDER PLACED (Checkout)
      if (event.type === "order") {
        const o = event.order;
        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <ShoppingBag className="w-4 h-4" />
              <span>Checkout completado</span>
            </div>
            <div className="flex flex-col gap-0.5 ml-6">
              {o?.order_code && <span className="text-sm font-medium">Orden #{o.order_code}</span>}
              {o?.total != null && <span className="text-xs text-muted-foreground">Total: {parseSoles(o.total)}</span>}
            </div>
          </div>
        );
      }

      // ❌ ORDER CANCELLED
      if (event.type === "order_cancelled") {
        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-red-500 font-medium">
              <Ban className="w-4 h-4" />
              <span>Orden #{event.order_id} cancelada</span>
            </div>
            {event.reason && <span className="text-xs text-muted-foreground ml-6">{event.reason}</span>}
          </div>
        );
      }

      // 💳 PAYMENT CONFIRMED
      if (event.type === "payment") {
        const p = event.payment;
        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-emerald-600 font-medium">
              <CreditCard className="w-4 h-4" />
              <span>Pago confirmado — {parseSoles(p?.amount ?? 0)}</span>
            </div>
            <div className="flex flex-col gap-0.5 ml-6">
              {p?.order_code && <span className="text-xs text-muted-foreground">Orden #{p.order_code}</span>}
              {p?.method && <span className="text-xs text-muted-foreground">Método: {p.method}</span>}
            </div>
          </div>
        );
      }

      // 🧾 VOUCHER UPLOADED
      if (event.type === "voucher") {
        return (
          <div className="flex items-center gap-2 text-teal-600 font-medium">
            <FileCheck className="w-4 h-4" />
            <span className="text-sm">
              Voucher subido — Orden #{event.order_id}
            </span>
          </div>
        );
      }

      return <span className="text-xs text-muted-foreground italic">Sin detalles</span>;
    },
  },
];