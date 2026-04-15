/* eslint-disable @typescript-eslint/no-explicit-any */
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Seo } from '@/types/seo/Seo';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload } from '@/components/custom-ui/upload';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import { Globe, Share2, Eye, Settings2, Edit3 } from 'lucide-react'; // Iconos sutiles para secciones
import { BackButton } from '@/components/custom-ui/PageHeader';
export default function SeoEdit({ seo }: { seo: Seo }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

   

    const form = useForm({
        _method: 'POST',
        meta_title: seo.meta_title || '',
        meta_description: seo.meta_description || '',
        meta_keywords: seo.meta_keywords || '',
        og_title: seo.og_title || '',
        og_description: seo.og_description || '',
        og_image: null as File | null,
        og_type: seo.og_type || 'website',
        canonical_url: seo.canonical_url || '',
        noindex: seo.noindex ?? false,
        nofollow: seo.nofollow ?? false,
    });

    // Helper para la URL base en los previews
    const displayUrl = form.data.canonical_url || 'https://tork.com/pagina';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/seo/${seo.id}`, { ...form.data }, {
            forceFormData: true,
            onStart: () => setIsSubmitting(true),
            onFinish: () => setIsSubmitting(false),
            onSuccess: () => toast.success('SEO actualizado correctamente'),
            onError: (err) => Object.values(err).forEach((msg: any) => toast.error(msg)),
        });
    };

    return (
        <AppLayout >
            <Head title="Editar Metadatos SEO" />
             <div className="mb-6 flex items-end gap-4">
                <BackButton></BackButton>
            </div>

            <div className="p-4 space-y-6">
                {/* Header Profesional */}
                <div className=" rounded-xl border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Editor de Seo</h1>
                        <p className="text-muted-foreground text-sm">Configure cómo se visualiza este contenido en internet.</p>
                    </div>
                    <div className="flex gap-3">
                        
                        <Button  onClick={handleSubmit} disabled={isSubmitting} className="min-w-[140px]">
                            <Edit3 className="w-4 h-4 mr-2" />
                            {isSubmitting ? 'Guardando...' : 'Editar SEO'} 
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* COLUMNA IZQUIERDA: CONFIGURACIÓN (7/12) */}
                    <div className="lg:col-span-7 space-y-8">
                        
                        {/* 1. META TAGS BÁSICOS */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-primary font-semibold">
                                <Globe className="w-4 h-4" />
                                <h2>Meta Tags Básicos</h2>
                            </div>
                            <div className="grid gap-5 p-6 border rounded-xl bg-card shadow-sm">
                                <div className="space-y-2">
                                    <Label htmlFor="meta_title">Meta Title</Label>
                                    <Input 
                                        id="meta_title"
                                        value={form.data.meta_title} 
                                        onChange={e => form.setData('meta_title', e.target.value)} 
                                        placeholder="Ej: Iniciar Sesión - Mi Sitio"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="meta_description">Meta Description</Label>
                                    <Textarea 
                                        id="meta_description"
                                        value={form.data.meta_description} 
                                        onChange={e => form.setData('meta_description', e.target.value)} 
                                        placeholder="Breve resumen para buscadores..."
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="meta_keywords">Meta Keywords</Label>
                                    <Input 
                                        id="meta_keywords"
                                        value={form.data.meta_keywords} 
                                        onChange={e => form.setData('meta_keywords', e.target.value)} 
                                        placeholder="login, iniciar sesión, cuenta"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* 2. OPEN GRAPH */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-primary font-semibold">
                                <Share2 className="w-4 h-4" />
                                <h2>Open Graph (Redes Sociales)</h2>
                            </div>
                            <div className="grid gap-5 p-6 border rounded-xl bg-card shadow-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="og_title">OG Title</Label>
                                        <Input id="og_title" value={form.data.og_title} onChange={e => form.setData('og_title', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>OG Type</Label>
                                        <Select value={form.data.og_type} onValueChange={(v: any) => form.setData('og_type', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="website">Website</SelectItem>
                                                <SelectItem value="article">Article</SelectItem>
                                                <SelectItem value="product">Product</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="og_description">OG Description</Label>
                                    <Textarea id="og_description" value={form.data.og_description} onChange={e => form.setData('og_description', e.target.value)} rows={2} />
                                </div>
                                <div className="space-y-2">
                                    <Label>OG Image</Label>
                                    <Upload 
                                        value={seo.og_image} 
                                        onFileChange={(file) => form.setData('og_image', file)} 
                                        previewClassName="aspect-[1.91/1] w-full rounded-lg border-2 border-dashed"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* 3. AVANZADO (ROBOTS) */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-primary font-semibold">
                                <Settings2 className="w-4 h-4" />
                                <h2>Configuración Avanzada</h2>
                            </div>
                            <div className="p-6 border rounded-xl bg-card shadow-sm space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="canonical_url">Canonical URL</Label>
                                    <Input id="canonical_url" value={form.data.canonical_url} onChange={e => form.setData('canonical_url', e.target.value)} placeholder="https://tork.com/..." />
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="flex items-center justify-between gap-4 p-3 border rounded-lg bg-zinc-50/50">
                                        <Label className="cursor-pointer">No Index</Label>
                                        <Switch checked={form.data.noindex} onCheckedChange={v => form.setData('noindex', v)} />
                                    </div>
                                    <div className="flex items-center justify-between gap-4 p-3 border rounded-lg bg-zinc-50/50">
                                        <Label className="cursor-pointer">No Follow</Label>
                                        <Switch checked={form.data.nofollow} onCheckedChange={v => form.setData('nofollow', v)} />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* COLUMNA DERECHA: PREVIEWS (5/12) */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="sticky top-6 space-y-8">
                            
                            {/* PREVIEW GOOGLE */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-muted-foreground font-semibold text-xs uppercase tracking-widest">
                                    <Eye className="w-3 h-3" />
                                    <span>Google Preview</span>
                                </div>
                                <div className="p-5 border rounded-xl bg-white dark:bg-zinc-950 shadow-sm">
                                    <div className="space-y-1">
                                        <cite className="not-italic text-[#202124] dark:text-[#bdc1c6] text-[14px] block truncate">
                                            {displayUrl}
                                        </cite>
                                        <h3 className="text-[#1a0dab] dark:text-[#8ab4f8] text-xl font-medium hover:underline cursor-pointer leading-tight truncate">
                                            {form.data.meta_title || 'Introduce un título...'}
                                        </h3>
                                        <p className="text-[#4d5156] dark:text-[#bdc1c6] text-sm leading-relaxed line-clamp-2">
                                            {form.data.meta_description || 'Aquí aparecerá la descripción de tu página en los resultados de búsqueda de Google.'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* PREVIEW REDES SOCIALES */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-muted-foreground font-semibold text-xs uppercase tracking-widest">
                                    <Eye className="w-3 h-3" />
                                    <span>Social Preview</span>
                                </div>
                                <div className="border rounded-xl bg-white dark:bg-[#18191a] shadow-sm overflow-hidden max-w-[480px]">
                                    {/* Simulación de imagen */}
                                    <div className="aspect-[1.91/1] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center relative overflow-hidden">
                                        {form.data.og_image ? (
                                            <img src={URL.createObjectURL(form.data.og_image)} className="w-full h-full object-cover" />
                                        ) : seo.og_image ? (
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
                                            {form.data.og_title || form.data.meta_title || 'Título de la tarjeta'}
                                        </div>
                                        <div className="text-[14px] text-[#65676b] dark:text-[#b0b3b8] line-clamp-1 mt-1">
                                            {form.data.og_description || form.data.meta_description || 'Descripción para redes sociales...'}
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