import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Seo } from '@/types/seo/Seo';
import { BreadcrumbItem } from '@/types';
import { buttonVariants } from '@/components/ui/button';
import { Globe, Share2, Settings2, ArrowLeft, Edit3, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/custom-ui/PageHeader';
function DataField({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {label}
            </label>
            <div className={`p-3 rounded-md border bg-zinc-50/30 dark:bg-zinc-900/20 text-sm ${!value ? 'text-muted-foreground/50 italic' : 'font-medium'}`}>
                {value || 'No definido'}
            </div>
        </div>
    );
}

export default function SeoShow({ seo }: { seo: Seo }) {
    

    const displayUrl = seo.canonical_url || '';

    return (
        <AppLayout>
            <Head title={`SEO - ${seo.metadatable?.title || 'Detalle'}`} />
             <div className="mb-6 flex items-end gap-4">
                <BackButton></BackButton>
            </div>

            <div className=" p-4 space-y-6">

                {/* HEADER */}
                <div className="rounded-xl border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4  pb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                {seo.metadatable?.title || 'Metadatos'}
                                <Badge variant="outline" className="font-mono text-[10px] uppercase">
                                    {seo.og_type}
                                </Badge>
                            </h1>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Globe className="w-3 h-3 text-primary" /> {displayUrl}
                            </p>
                        </div>
                    </div>
                    <div className='flex gap-3'>
          
                    <Link
                        href={`/seo/${seo.id}/edit`}
                        className={buttonVariants({ variant: 'default', className: 'min-w-[140px]' })}
                    >
                        <Edit3 className="w-4 h-4 mr-2" /> Editar SEO
                    </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* COLUMNA IZQUIERDA */}
                    <div className="lg:col-span-7 space-y-8">

                        {/* META TAGS BÁSICOS */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-primary font-semibold">
                                <Globe className="w-4 h-4" />
                                <h2>Meta Tags Básicos</h2>
                            </div>
                            <div className="grid gap-5 p-6 border rounded-xl bg-card shadow-sm">
                                <DataField label="Meta Title" value={seo.meta_title} />
                                <DataField label="Meta Description" value={seo.meta_description} />
                                <DataField label="Meta Keywords" value={seo.meta_keywords} />
                            </div>
                        </section>

                        {/* OPEN GRAPH */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-primary font-semibold">
                                <Share2 className="w-4 h-4" />
                                <h2>Open Graph (Redes Sociales)</h2>
                            </div>
                            <div className="grid gap-5 p-6 border rounded-xl bg-card shadow-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <DataField label="OG Title" value={seo.og_title} />
                                    <DataField label="OG Type" value={seo.og_type} />
                                </div>
                                <DataField label="OG Description" value={seo.og_description} />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">OG Image Actual</label>
                                    <div className="aspect-[1.91/1] w-full rounded-lg border overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                        {seo.og_image ? (
                                            <img src={seo.og_image} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground italic text-xs">
                                                Sin imagen asignada
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* AVANZADO */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-primary font-semibold">
                                <Settings2 className="w-4 h-4" />
                                <h2>Configuración Avanzada</h2>
                            </div>
                            <div className="p-6 border rounded-xl bg-card shadow-sm space-y-6">
                                <DataField label="Canonical URL" value={seo.canonical_url} />
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="flex items-center justify-between p-3 border rounded-lg bg-zinc-50/50">
                                        <span className="text-sm font-medium">No Index</span>
                                        <Badge variant={seo.noindex ? 'destructive' : 'outline'}>
                                            {seo.noindex ? 'Activado' : 'Desactivado'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded-lg bg-zinc-50/50">
                                        <span className="text-sm font-medium">No Follow</span>
                                        <Badge variant={seo.nofollow ? 'destructive' : 'outline'}>
                                            {seo.nofollow ? 'Activado' : 'Desactivado'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* COLUMNA DERECHA: PREVIEWS */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="sticky top-6 space-y-8">

                            {/* GOOGLE PREVIEW */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-muted-foreground font-semibold text-xs uppercase tracking-widest">
                                    <Search className="w-3 h-3" />
                                    <span>Google Preview</span>
                                </div>
                                <div className="p-5 border rounded-xl bg-white dark:bg-zinc-950 shadow-sm">
                                    <div className="space-y-1">
                                        <cite className="not-italic text-[#202124] dark:text-[#bdc1c6] text-[14px] block truncate">
                                            {displayUrl}
                                        </cite>
                                        <h3 className="text-[#1a0dab] dark:text-[#8ab4f8] text-xl font-medium leading-tight truncate">
                                            {seo.meta_title || 'Título faltante'}
                                        </h3>
                                        <p className="text-[#4d5156] dark:text-[#bdc1c6] text-sm leading-relaxed line-clamp-2">
                                            {seo.meta_description || 'Sin descripción meta.'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* SOCIAL PREVIEW */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-muted-foreground font-semibold text-xs uppercase tracking-widest">
                                    <Share2 className="w-3 h-3" />
                                    <span>Social Preview</span>
                                </div>
                                <div className="border rounded-xl bg-white dark:bg-[#18191a] shadow-sm overflow-hidden max-w-[480px]">
                                    <div className="aspect-[1.91/1] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center relative overflow-hidden">
                                        {seo.og_image ? (
                                            <img src={seo.og_image} className="w-full h-full object-cover" />
                                        ) : (
                                            <Share2 className="w-12 h-12 text-zinc-300" />
                                        )}
                                    </div>
                                    <div className="p-3 bg-[#f0f2f5] dark:bg-[#242526] border-t">
                                        <div className="text-[12px] text-[#65676b] dark:text-[#b0b3b8] uppercase">
                                            {new URL(displayUrl).hostname}
                                        </div>
                                        <div className="font-bold text-[16px] text-[#050505] dark:text-[#e4e6eb] leading-tight mt-1 truncate">
                                            {seo.og_title || seo.meta_title || 'Título social'}
                                        </div>
                                        <div className="text-[14px] text-[#65676b] dark:text-[#b0b3b8] line-clamp-1 mt-1">
                                            {seo.og_description || seo.meta_description || 'Sin descripción social.'}
                                        </div>
                                    </div>
                                </div>
                            </section>

                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}