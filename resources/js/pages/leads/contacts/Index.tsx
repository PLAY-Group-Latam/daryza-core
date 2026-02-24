import TableList from '@/components/custom-ui/leads/contacts/TableList';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Info } from 'lucide-react';

export default function Index() {
    const { paginatedContacts, filters } = usePage<any>().props;

    const contactTypes = [
        { value: 'help_center', label: 'Centro de Ayuda' },
        { value: 'distributor_network', label: 'Red de Distribuidores' },
        { value: 'customer_service', label: 'Servicio al Cliente' },
        { value: 'sales_advisor', label: 'Asesor Comercial' },
    ];

    const handleTypeChange = (value: string) => {
        const url = `/contacts/items`;

        router.get(
            url,
            {
                ...filters,
                type: value,
                page: 1,
            },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Lista de Contactos" />

            <div className="flex flex-1 flex-col gap-6 rounded-xl p-4 lg:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-lg font-bold lg:text-2xl">
                            Bandeja de Contactos
                        </h1>
                        <div className="mb-4 flex items-center gap-2 mt-6">
                            <span className="text-sm font-medium text-muted-foreground">
                                Fuente de datos:
                            </span>
                            <Badge
                                variant="secondary"
                                className="border-blue-200    bg-blue-50 px-3 py-1 text-xs font-bold tracking-wider text-blue-700 uppercase dark:bg-blue-900/30 dark:text-blue-300"
                            >
                                {
                                    contactTypes.find(
                                        (t) =>
                                            t.value ===
                                            (filters.type || 'help_center'),
                                    )?.label
                                }
                            </Badge>
                        </div>
                    </div>

                    {/* Selector con Tooltip de información */}
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="hover:text-brand-red cursor-help text-slate-400 transition-colors">
                                        <Info size={20} />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p>
                                        Selecciona el tipo de formulario para
                                        filtrar las solicitudes recibidas en
                                        cada categoría.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <Select
                            defaultValue={filters.type || 'help_center'}
                            onValueChange={handleTypeChange}
                        >
                            <SelectTrigger className="h-11' w-full md:w-[280px]">
                                <SelectValue placeholder="Tipo de Contacto" />
                            </SelectTrigger>
                            <SelectContent>
                                {contactTypes.map((type) => (
                                    <SelectItem
                                        key={type.value}
                                        value={type.value}
                                    >
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Tabla Dinámica */}
                <div>
                    <TableList data={paginatedContacts} filters={filters} />
                </div>
            </div>
        </AppLayout>
    );
}
