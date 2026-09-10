<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Configuración de órdenes
    |--------------------------------------------------------------------------
    |
    | Ventana (en días) que una orden permanece en estado `pending_payment`
    | antes de que el comando `orders:expire-pending-transfers` la cancele
    | automáticamente y reponga el stock.
    |
    */

    'pending_payment_expire_days' => (int) env('ORDERS_PENDING_PAYMENT_EXPIRE_DAYS', 5),
];
