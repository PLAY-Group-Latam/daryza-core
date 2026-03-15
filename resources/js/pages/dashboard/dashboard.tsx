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
    DollarSign,
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
    const [isLoading, setIsLoading] = useState(false); // ✅ DENTRO del componente

    // ✅ DENTRO del componente
    useEffect(() => {
        const removeStart = router.on('start', () => setIsLoading(true));
        const removeFinish = router.on('finish', () => setIsLoading(false));
        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    const handleDateRangeChange = (values: { range: DateRange }) => {
        const { from, to } = values.range;
        const formattedFrom = from ? format(from, 'yyyy-MM-dd HH:mm:ss') : '';
        const formattedTo = to ? format(to, 'yyyy-MM-dd HH:mm:ss') : '';
        setDateRange({ from: formattedFrom, to: formattedTo });
        router.get('/dashboard', { from: formattedFrom, to: formattedTo }, { preserveScroll: true, preserveState: true });
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="rounded-xl border py-6 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
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

                    <Card className="rounded-xl border py-6 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
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

                    <Card className="rounded-xl border py-6 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
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

                    <Card className="rounded-xl border py-6 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Tasa Conversión</CardTitle>
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

                {/* Charts Section */}
                {/* Charts Section */}
                <div className="grid gap-6 lg:grid-cols-2">

                    {/* 1. Gráfico de Ventas Mensuales */}
                    <Card className="rounded-xl border py-6 shadow-sm overflow-hidden"> {/* overflow-hidden para evitar que el scroll manche los bordes redondeados */}
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-slate-800">
                                Ventas y Pedidos Mensuales
                            </CardTitle>
                            <CardDescription>
                                Evolución de ventas e ingresos durante el último año
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* ESTE ES EL CONTENEDOR DEL SCROLL */}
                            <div className="w-full overflow-x-auto pb-6 custom-scrollbar">
                                {/* Forzamos un ancho mínimo para que el gráfico no se comprima */}
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
                            {/* ESTE ES EL CONTENEDOR DEL SCROLL */}
                            <div className="w-full overflow-x-auto pb-6 custom-scrollbar">
                                {/* Forzamos un ancho mínimo aquí también */}
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
                    {/* Detalle de Productos Top */}
                    <Card className="rounded-xl border shadow-sm overflow-hidden">
                        <CardHeader >
                            <CardTitle className="text-xl font-bold text-slate-800">Detalle de Productos Top</CardTitle>
                            <CardDescription>Información detallada de los productos más exitosos</CardDescription>
                        </CardHeader>
                        {/* Eliminamos el padding lateral del CardContent para que el scroll llegue al borde */}
                        <CardContent className="p-0">
                            <div className="w-full overflow-x-auto">
                                {/* min-w-full asegura que ocupe todo el ancho, y el scroll se activa por el contenido */}
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
                                                {/* truncate evita que nombres gigantes rompan la tabla */}
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

                    {/* Detalle de Categorías */}
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
