import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { DateRangePicker } from '@/components/ui/date-range-picker';
import AppLayout from '@/layouts/app-layout';
import { parseSoles } from '@/lib/helpers/parseSoles';
import { type BreadcrumbItem } from '@/types';
import {
    CategoryData,
    KPIData,
    SalesData,
    TopProduct,
} from '@/types/dashboard';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Info,
    Package,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import {
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    Line,
    LineChart,
    XAxis,
    YAxis,
} from 'recharts';

const chartConfig = {
    sales: { label: 'Ventas', color: '#2563eb' },
    orders: { label: 'Pedidos', color: '#60a5fa' },
    revenue: { label: 'Ingresos', color: '#6366f1' },
} satisfies ChartConfig;

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

function renderGrowth(value: number) {
    const isPositive = value >= 0;
    return (
        <p className={`mt-2 flex items-center text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
            {Math.abs(value)}% vs periodo anterior
        </p>
    );
}

function KpiSkeleton() {
    return (
        <div className="animate-pulse space-y-3">
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="h-8 w-32 rounded bg-slate-200" />
            <div className="h-3 w-20 rounded bg-slate-200" />
        </div>
    );
}

interface DashboardProps {
    filters: { from: string; to: string };
    kpiData: KPIData;
    salesData: SalesData[];
    topProductsData: TopProduct[];
    categoryData: CategoryData[];
}

export default function Dashboard({
    filters,
    kpiData,
    salesData,
    topProductsData,
    categoryData,
}: DashboardProps) {
    const [dateRange, setDateRange] = useState({ from: filters.from, to: filters.to });
    const [isLoading, setIsLoading] = useState(false);

    const handleDateRangeChange = (values: { range: DateRange }) => {
        const { from, to } = values.range;
        if (!from || !to) return;

        const formattedFrom = format(from, 'yyyy-MM-dd HH:mm:ss');
        const formattedTo = format(to, 'yyyy-MM-dd HH:mm:ss');

        setIsLoading(true);

        router.get(
            '/dashboard',
            { from: formattedFrom, to: formattedTo },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setIsLoading(false),
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Ecommerce" />

            <div className="flex min-h-screen flex-col gap-6 p-0">
                {/* Header */}
                <div className="flex flex-col gap-12 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Dashboard Ecommerce
                        </h1>
                        <p className="text-base text-muted-foreground">
                            Resumen de rendimiento y métricas clave
                        </p>
                    </div>
                    <DateRangePicker
                        onUpdate={handleDateRangeChange}
                        initialDateFrom={dateRange.from}
                        initialDateTo={dateRange.to}
                        align="end"
                        locale="es-PE"
                    />
                </div>

                {/* KPIs Cards */}
                <TooltipProvider>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {/* Ventas Totales */}
                        <Card className="rounded-xl border py-6 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Dinero total de ventas confirmadas.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <span className="text-xs font-bold text-muted-foreground">S/</span>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <KpiSkeleton /> : (
                                    <>
                                        <div className="text-2xl font-bold">{parseSoles(kpiData.totalSales)}</div>
                                        {renderGrowth(kpiData.salesGrowth)}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Pedidos */}
                        <Card className="rounded-xl border py-6 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Número de compras realizadas con éxito.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <KpiSkeleton /> : (
                                    <>
                                        <div className="text-2xl font-bold">{kpiData.totalOrders}</div>
                                        {renderGrowth(kpiData.ordersGrowth)}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Ticket Promedio */}
                        <Card className="rounded-xl border py-6 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Lo que gasta un cliente en promedio por cada compra.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <KpiSkeleton /> : (
                                    <>
                                        <div className="text-2xl font-bold">{parseSoles(kpiData.averageTicket)}</div>
                                        {renderGrowth(kpiData.ticketGrowth)}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tasa Conversión */}
                        <Card className="rounded-xl border py-6 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-sm font-medium">Tasa Conversión</CardTitle>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Porcentaje de visitas que terminan en una compra.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <KpiSkeleton /> : (
                                    <>
                                        <div className="text-2xl font-bold">{kpiData.conversionRate}%</div>
                                        {renderGrowth(kpiData.conversionGrowth)}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TooltipProvider>

                {/* Charts Section */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* 1. Gráfico de Ventas Mensuales */}
                    <Card className="rounded-xl border py-6 shadow-sm overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-slate-800">
                                Ventas y Pedidos Mensuales
                            </CardTitle>
                            <CardDescription>
                                Evolución de ventas e ingresos durante el último año
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full overflow-x-auto pb-6 custom-scrollbar">
                                <div className="min-w-[700px] h-[350px]">
                                    <ChartContainer config={chartConfig} className="h-full w-full">
                                        <LineChart data={salesData} margin={{ left: 10, right: 10, top: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ChartContainer>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Gráfico de Top Productos */}
                    <Card className="rounded-xl border py-6 shadow-sm overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-slate-800">Top Productos</CardTitle>
                            <CardDescription>Productos con mayores ingresos este mes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full overflow-x-auto pb-6 custom-scrollbar">
                                <div className="min-w-[700px] h-[350px]">
                                    <ChartContainer config={chartConfig} className="h-full w-full">
                                        <BarChart data={topProductsData} margin={{ top: 40, bottom: 20, left: 10, right: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis
                                                dataKey="product"
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                                                tickFormatter={(v) => v.length > 15 ? v.slice(0, 15) + '…' : v}
                                                interval={0}
                                            />
                                            <YAxis tickFormatter={(v) => `S/${v / 1000}k`} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={50}>
                                                <LabelList
                                                    dataKey="revenue"
                                                    position="top"
                                                    formatter={(v: any) => `S/ ${v.toLocaleString()}`}
                                                    style={{ fontSize: '11px', fontWeight: 'bold', fill: '#64748b' }}
                                                />
                                            </Bar>
                                        </BarChart>
                                    </ChartContainer>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tablas Detalladas */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="rounded-xl border shadow-sm overflow-hidden">
                        <CardHeader >
                            <CardTitle className="text-xl font-bold text-slate-800">Detalle de Productos Top</CardTitle>
                            <CardDescription>Información detallada de los productos más exitosos</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="w-full overflow-x-auto">
                                <table className="w-full min-w-[500px] border-collapse">
                                    <thead>
                                        <tr >
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Producto</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold">Unidades</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold">Ingresos</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-300">
                                        {topProductsData.map((p) => (
                                            <tr key={p.product} className="transition-colors hover:bg-slate-50">
                                                <td className="px-6 py-4 text-sm font-bold text-slate-700 max-w-[200px] truncate">
                                                    {p.product}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-medium text-slate-600">
                                                    {p.sales}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                                                    {parseSoles(p.revenue)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border shadow-sm overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-slate-800">Detalle de Categorías</CardTitle>
                            <CardDescription>Artículos vendidos e ingresos por categoría</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="w-full overflow-x-auto">
                                <table className="w-full min-w-[500px] border-collapse">
                                    <thead>
                                        <tr >
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Categoría</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold">Unidades</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold">Ingresos</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-300">
                                        {categoryData.map((cat) => (
                                            <tr key={cat.name} className="transition-colors hover:bg-slate-50">
                                                <td className="px-6 py-4 text-sm font-bold text-slate-700">{cat.name}</td>
                                                <td className="px-6 py-4 text-right text-sm font-medium text-slate-600">{cat.units}</td>
                                                <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">{parseSoles(cat.revenue)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}