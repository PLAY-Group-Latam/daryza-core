export interface KPIData {
    totalSales: number;
    totalOrders: number;
    averageTicket: number;
    conversionRate: number;
    salesGrowth: number; // Nuevo campo para crecimiento de ventas
    ordersGrowth: number; // Nuevo campo para crecimiento de órdenes
    ticketGrowth: number; // Nuevo campo para crecimiento del ticket promedio
    conversionGrowth:number;
}

export interface SalesData {
    month: string;
    sales: number;
    orders: number;
}

export interface TopProduct {
    product: string;
    sales: number;
    revenue: number;
}

export interface CategoryData {
    name: string;
    units: number;
    revenue: number;
}

export interface DashboardData {
    kpis: KPIData;
    salesHistory: SalesData[];
    topProducts: TopProduct[];
    categories: CategoryData[];
}