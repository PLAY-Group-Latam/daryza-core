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
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    DollarSign,
    Package,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useState } from 'react';
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
        <p
            className={`mt-2 flex items-center text-xs font-medium ${
                isPositive ? 'text-green-500' : 'text-red-500'
            }`}
        >
            {isPositive ? (
                <TrendingUp className="mr-1 h-3 w-3" />
            ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
            )}
            {Math.abs(value)}% vs periodo anterior
        </p>
    );
}

interface DashboardProps {
    filters: {
        from: string;
        to: string;
    };
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
    const [dateRange, setDateRange] = useState({
        from: filters.from,
        to: filters.to,
    });

    const handleDateRangeChange = (values: { range: DateRange }) => {
        const { from, to } = values.range;

        const formattedFrom = from ? format(from, 'yyyy-MM-dd HH:mm:ss') : '';
        const formattedTo = to ? format(to, 'yyyy-MM-dd HH:mm:ss') : '';

        setDateRange({
            from: formattedFrom,
            to: formattedTo,
        });
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
                    <Card className="rounded-xl border py-6 shadow-sm ">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Ventas Totales
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>

                        <CardContent>
                            <div className="text-2xl font-bold">
                                {parseSoles(kpiData.totalSales)}
                            </div>

                            {renderGrowth(kpiData.salesGrowth)}
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border py-6 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pedidos
                            </CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>

                        <CardContent>
                            <div className="text-2xl font-bold">
                                {kpiData.totalOrders}
                            </div>

                            {renderGrowth(kpiData.salesGrowth)}
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border py-6 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Ticket Promedio
                            </CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>

                        <CardContent>
                            <div className="text-2xl font-bold">
                                {parseSoles(kpiData.averageTicket)}
                            </div>
                            {renderGrowth(kpiData.salesGrowth)}
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border py-6 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Tasa Conversión
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>

                        <CardContent>
                            <div className="text-2xl font-bold">
                                {kpiData.conversionRate}%
                            </div>

                            {renderGrowth(kpiData.salesGrowth)}
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="rounded-xl border py-6 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-slate-800">
                                Ventas y Pedidos Mensuales
                            </CardTitle>

                            <CardDescription>
                                Evolución de ventas e ingresos durante el último
                                año
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <ChartContainer
                                config={chartConfig}
                                className="h-[350px] w-full"
                            >
                                <LineChart
                                    data={salesData}
                                    margin={{ left: 20, right: 20 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#f0f0f0"
                                    />

                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />

                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />

                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="sales"
                                        stroke="#2563eb"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#2563eb' }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border py-6 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-slate-800">
                                Top Productos
                            </CardTitle>

                            <CardDescription>
                                Productos con mayores ingresos este mes
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <ChartContainer
                                config={chartConfig}
                                className="h-[350px] w-full"
                            >
                                <BarChart
                                    data={topProductsData}
                                    margin={{ top: 40, bottom: 20 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#f0f0f0"
                                    />

                                    <XAxis dataKey="product" hide />

                                    <YAxis
                                        tickFormatter={(v) => `S/${v / 1000}k`}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />

                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />

                                    <Bar
                                        dataKey="revenue"
                                        fill="#6366f1"
                                        radius={[4, 4, 0, 0]}
                                        barSize={60}
                                    >
                                        <LabelList
                                            dataKey="revenue"
                                            position="top"
                                            formatter={(v: any) =>
                                                `S/ ${v.toLocaleString()}`
                                            }
                                            style={{
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                fill: '#64748b',
                                            }}
                                        />
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Tablas Detalladas */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="rounded-xl border py-6 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-slate-800">
                                Detalle de Productos Top
                            </CardTitle>

                            <CardDescription>
                                Información detallada de los productos más
                                exitosos
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="w-full overflow-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b text-slate-500">
                                            <th className="pb-4 text-left text-sm font-semibold">
                                                Producto
                                            </th>

                                            <th className="pb-4 text-right text-sm font-semibold">
                                                Unidades
                                            </th>

                                            <th className="pb-4 text-right text-sm font-semibold">
                                                Ingresos
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {topProductsData.map((p) => (
                                            <tr
                                                key={p.product}
                                                className="transition-colors hover:bg-slate-50"
                                            >
                                                <td className="max-w-[280px] py-4 text-sm font-bold text-slate-700">
                                                    {p.product}
                                                </td>

                                                <td className="py-4 text-right text-sm font-medium text-slate-600">
                                                    {p.sales}
                                                </td>

                                                <td className="py-4 text-right text-sm font-bold text-slate-900">
                                                    {parseSoles(p.revenue)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border py-6 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-slate-800">
                                Detalle de Categorías
                            </CardTitle>

                            <CardDescription>
                                Información del número de artículos vendidos e
                                ingresos por categoría
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="w-full overflow-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b text-slate-500">
                                            <th className="pb-4 text-left text-sm font-semibold">
                                                Categoría
                                            </th>

                                            <th className="pb-4 text-right text-sm font-semibold">
                                                Unidades
                                            </th>

                                            <th className="pb-4 text-right text-sm font-semibold">
                                                Ingresos
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {categoryData.map((cat) => (
                                            <tr
                                                key={cat.name}
                                                className="transition-colors hover:bg-slate-50"
                                            >
                                                <td className="py-4 text-sm font-bold text-slate-700">
                                                    {cat.name}
                                                </td>

                                                <td className="py-4 text-right text-sm font-medium text-slate-600">
                                                    {cat.units}
                                                </td>

                                                <td className="py-4 text-right text-sm font-bold text-slate-900">
                                                    {parseSoles(cat.revenue)}
                                                </td>
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
