import { ItemType } from "@/lib/helpers/ItemTypes";

type LogProduct = {
    name: string;
    size: string;
    sku: string;
    color: string;
    price: number;
    priceTotal: number;
    quantity: number;
    type?: ItemType;
};

type LogCart = {
    price: number;
    items: Array<LogProduct>;
};

export type LogProductData = {
    product: LogProduct;
};

export type LogCartData = {
    cart: LogCart;
};

export type LogCouponData = {
    message: string;
};

export type LogData = LogProductData | LogCartData | LogCouponData;