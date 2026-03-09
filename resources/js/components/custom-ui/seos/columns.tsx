'use client';

import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit2, Eye, Globe } from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import { Seo } from '@/types/seo/Seo';

export const columns = (
    onDelete: (id: string) => void
): ColumnDef<Seo>[] => [
    {
        id: 'page_info',
        header: () => <div className="pl-4">Página Relacionada</div>,
        cell: ({ row }) => {
            const seo = row.original;
            // Usamos la URL canónica directamente
            const url = seo.canonical_url || '#'; 
            const pageTitle = seo.metadatable?.title || 'Sin Título';

            return (
                <div className="flex flex-col pl-4">
                    <span className="font-bold text-sm">
                        {pageTitle}
                    </span>
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-500 hover:underline flex items-center gap-1 truncate max-w-[250px]"
                        title={url}
                    >
                       
                        {url}
                    </a>
                </div>
            );
        },
    },
    {
        accessorKey: 'meta_title',
        header: 'Meta Title',
        cell: ({ row }) => <div className="max-w-[180px] truncate">{row.getValue('meta_title') || '-'}</div>
    },
    {
        accessorKey: 'meta_description',
        header: 'Meta Description',
        cell: ({ row }) => {
            const description = row.getValue('meta_description') as string | null;
            return <div className="max-w-[220px] truncate text-muted-foreground italic text-xs">
                {description || '-'}
            </div>;
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Creado',
        cell: ({ row }) => formatDate(row.getValue('created_at') as string),
    },
    {
        accessorKey: 'updated_at',
        header: 'Actualizado',
        cell: ({ row }) => formatDate(row.getValue('updated_at') as string),
    },
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
            const seo = row.original;

            return (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Link
                        href={`/seo/${seo.id}`}
                        className={buttonVariants({ variant: 'outline', size: 'icon' })}
                        title="Ver detalle"
                    >
                        <Eye className="h-4 w-4 text-blue-500" />
                    </Link>

                    <Button variant="outline" size="icon" asChild title="Editar">
                        <Link href={`/seo/${seo.id}/edit`}>
                            <Edit2 className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            );
        },
    },
];