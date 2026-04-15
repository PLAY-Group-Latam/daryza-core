import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Briefcase, Download, Mail, Phone, User } from 'lucide-react';
import { BackButton } from '@/components/custom-ui/PageHeader';
type Application = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    cv_path: string;
    job?: {
        id: string;
        title: string;
        slug: string;
        modality?: string | null;
        vacancies?: number | null;
        area?: { id: string; name: string } | null;
        place?: { id: string; name: string; city: string; address?: string | null } | null;
    };
};

export default function Show() {
    const { application } = usePage<{ application: Application }>().props;
    const fullName = `${application.first_name} ${application.last_name}`;
    const initials =
        `${application.first_name?.[0] ?? ''}${application.last_name?.[0] ?? ''}`.toUpperCase();
    const cvUrl = application.cv_path.startsWith('http')
        ? application.cv_path
        : `/storage/${application.cv_path}`;
    const modalityLabel: Record<string, string> = {
        on_site: 'Presencial',
        remote: 'Remoto',
        hybrid: 'Híbrido',
    };

    return (
        <AppLayout>
            <Head title="Detalle de Postulación" />
             <div className="mb-6 flex items-end gap-4">
                <BackButton></BackButton>
            </div>
            <div className="mt-6 flex flex-1 flex-col gap-5 rounded-xl">
                <div className="rounded-xl border p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-bold">
                                {initials}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    Detalle de postulación
                                </p>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <h1 className="text-xl leading-tight font-bold">
                                        {fullName}
                                    </h1>
                                </div>
                            </div>
                        </div>
                        <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end">
                            
                            <Button
                                size="sm"
                                className="flex-1 sm:flex-none"
                                asChild
                            >
                                <a
                                    href={cvUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Descargar CV
                                </a>
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 sm:flex-none"
                                asChild
                            >
                                <a href={`mailto:${application.email}`}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Enviar correo
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <section className="space-y-4 rounded-xl border border-border/70 bg-background p-5 lg:col-span-2">
                        <h2 className="flex items-center gap-2 text-base font-semibold">
                            <User className="h-5 w-5" />
                            Información del candidato
                        </h2>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                                <p className="text-xs text-muted-foreground">
                                    Nombre completo
                                </p>
                                <p className="mt-1 text-sm">{fullName}</p>
                            </div>
                            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                                <p className="text-xs text-muted-foreground">
                                    Correo
                                </p>
                                <a
                                    className="mt-1 inline-flex items-center gap-2 text-sm hover:underline"
                                    href={`mailto:${application.email}`}
                                >
                                    <Mail className="h-4 w-4" />
                                    {application.email}
                                </a>
                            </div>
                            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                                <p className="text-xs text-muted-foreground">
                                    Teléfono
                                </p>
                                <div className="mt-1 inline-flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4" />
                                    {application.phone}
                                </div>
                            </div>
                            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                                <p className="text-xs text-muted-foreground">
                                    Oferta postulada
                                </p>
                                <p className="mt-1 text-sm">
                                    {application.job?.title ?? 'No disponible'}
                                </p>
                            </div>
                            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                                <p className="text-xs text-muted-foreground">
                                    Área
                                </p>
                                <p className="mt-1 text-sm">
                                    {application.job?.area?.name ?? 'No disponible'}
                                </p>
                            </div>
                            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                                <p className="text-xs text-muted-foreground">
                                    Sede
                                </p>
                                <p className="mt-1 text-sm">
                                    {application.job?.place?.name ?? 'No disponible'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {application.job?.place?.city ?? '-'}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4 rounded-xl border border-border/70 bg-background p-5">
                        <div className="flex items-center gap-2">
                            <h2 className="flex items-center gap-2 text-base font-semibold">
                                <Briefcase className="h-5 w-5" />
                                Resumen
                            </h2>
                            <div>
                                <Badge
                                    variant="secondary"
                                    className="font-medium"
                                >
                                    Postulación recibida
                                </Badge>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                                <p className="text-xs text-muted-foreground">
                                    ID de postulación
                                </p>
                                <p className="mt-1 font-mono text-sm break-all">
                                    {application.id}
                                </p>
                            </div>
                            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                                <p className="text-xs text-muted-foreground">
                                    Slug de la oferta
                                </p>
                                <p className="mt-1 font-mono text-sm">
                                    {application.job?.slug ?? '-'}
                                </p>
                            </div>
                            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                                <p className="text-xs text-muted-foreground">
                                    Modalidad y vacantes
                                </p>
                                <p className="mt-1 text-sm">
                                    {application.job?.modality
                                        ? modalityLabel[application.job.modality] ?? application.job.modality
                                        : 'No disponible'}
                                    {' · '}
                                    {application.job?.vacancies ?? '-'} vacante(s)
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
