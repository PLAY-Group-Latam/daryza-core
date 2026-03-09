import { useState } from 'react';
import { Department, Province, ZoneType } from '@/models/Ubigeos';
import { Actions } from './actions';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ZoneColumnsProps {
    departments: Department[];
}

export function ZoneColumns({ departments }: ZoneColumnsProps) {
    const [selectedDept, setSelectedDept] = useState<Department | null>(null);
    const [selectedProv, setSelectedProv] = useState<Province | null>(null);

    // Mobile step: 0 = departamentos, 1 = provincias, 2 = distritos
    const [mobileStep, setMobileStep] = useState(0);

    const provinces = selectedDept?.provinces ?? [];
    const districts = selectedProv?.districts ?? [];

    const handleSelectDept = (dept: Department) => {
        setSelectedDept(dept);
        setSelectedProv(null);
        setMobileStep(1);
    };

    const handleSelectProv = (prov: Province) => {
        setSelectedProv(prov);
        setMobileStep(2);
    };

    const mobileBack = () => {
        if (mobileStep === 2) {
            setSelectedProv(null);
            setMobileStep(1);
        } else if (mobileStep === 1) {
            setSelectedDept(null);
            setMobileStep(0);
        }
    };

    // Mobile header: muestra en qué nivel estamos
    const mobileStepLabel = [
        'Departamentos',
        selectedDept?.name ?? 'Provincias',
        selectedProv?.name ?? 'Distritos',
    ];

    return (
        <div className="flex flex-col gap-3">

            {/* Mobile nav bar */}
            <div className="flex items-center gap-2 md:hidden">
                {mobileStep > 0 && (
                    <button
                        onClick={mobileBack}
                        className="flex items-center gap-1 text-sm font-medium text-primary"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Atrás
                    </button>
                )}
                <span className="text-sm font-semibold text-foreground">
                    {mobileStepLabel[mobileStep]}
                </span>
                {/* Step dots */}
                <div className="ml-auto flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all ${
                                i === mobileStep
                                    ? 'w-4 bg-primary'
                                    : 'w-1.5 bg-muted-foreground/25'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Desktop breadcrumb */}
            {(selectedDept || selectedProv) && (
                <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
                    <button
                        className="text-primary font-medium hover:underline"
                        onClick={() => { setSelectedDept(null); setSelectedProv(null); }}
                    >
                        Todos
                    </button>
                    {selectedDept && (
                        <>
                            <span>›</span>
                            <button
                                className={`font-medium hover:underline ${selectedProv ? 'text-primary' : 'text-foreground'}`}
                                onClick={() => setSelectedProv(null)}
                            >
                                {selectedDept.name}
                            </button>
                        </>
                    )}
                    {selectedProv && (
                        <>
                            <span>›</span>
                            <span className="text-foreground font-medium">{selectedProv.name}</span>
                        </>
                    )}
                </div>
            )}

            {/* Columns grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Departamentos */}
                <div className={mobileStep === 0 ? 'block' : 'hidden md:block'}>
                    <Column title="Departamentos" count={departments.length}>
                        {departments.map((dept) => (
                            <ColumnRow
                                key={dept.id}
                                name={dept.name}
                                hasZone={!!dept.delivery_zone}
                                isSelected={selectedDept?.id === dept.id}
                                hasChildren
                                onClick={() => handleSelectDept(dept)}
                                actions={
                                    <Actions
                                        id={dept.id}
                                        zoneType={ZoneType.DEPARTMENT}
                                        data={dept.delivery_zone}
                                    />
                                }
                            />
                        ))}
                    </Column>
                </div>

                {/* Provincias */}
                <div className={mobileStep === 1 ? 'block' : 'hidden md:block'}>
                    <Column title="Provincias" count={provinces.length}>
                        {provinces.length === 0 ? (
                            <EmptyState message="Selecciona un departamento" />
                        ) : (
                            provinces.map((prov) => (
                                <ColumnRow
                                    key={prov.id}
                                    name={prov.name}
                                    hasZone={!!prov.delivery_zone}
                                    isSelected={selectedProv?.id === prov.id}
                                    hasChildren
                                    onClick={() => handleSelectProv(prov)}
                                    actions={
                                        <Actions
                                            id={prov.id}
                                            zoneType={ZoneType.PROVINCE}
                                            data={prov.delivery_zone}
                                        />
                                    }
                                />
                            ))
                        )}
                    </Column>
                </div>

                {/* Distritos */}
                <div className={mobileStep === 2 ? 'block' : 'hidden md:block'}>
                    <Column title="Distritos" count={districts.length}>
                        {districts.length === 0 ? (
                            <EmptyState message="Selecciona una provincia" />
                        ) : (
                            districts.map((dist) => (
                                <ColumnRow
                                    key={dist.id}
                                    name={dist.name}
                                    hasZone={!!dist.delivery_zone}
                                    isSelected={false}
                                    hasChildren={false}
                                    onClick={() => {}}
                                    actions={
                                        <Actions
                                            id={dist.id}
                                            zoneType={ZoneType.DISTRICT}
                                            data={dist.delivery_zone}
                                        />
                                    }
                                />
                            ))
                        )}
                    </Column>
                </div>

            </div>
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Column({
    title,
    count,
    children,
}: {
    title: string;
    count: number;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {title}
                </span>
                {count > 0 && (
                    <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {count}
                    </span>
                )}
            </div>
            {/* Sin max-h fijo en mobile para que no corte */}
            <div className="overflow-y-auto md:max-h-[520px] divide-y">
                {children}
            </div>
        </div>
    );
}

interface ColumnRowProps {
    name: string;
    hasZone: boolean;
    isSelected: boolean;
    hasChildren: boolean;
    onClick: () => void;
    actions: React.ReactNode;
}

function ColumnRow({ name, hasZone, isSelected, hasChildren, onClick, actions }: ColumnRowProps) {
    return (
        <div
            onClick={onClick}
            className={`
                group flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
                ${isSelected ? 'bg-accent' : 'hover:bg-muted/50'}
            `}
        >
            {/* Zone dot */}
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${hasZone ? 'bg-emerald-500' : 'bg-muted-foreground/25'}`} />

            {/* Name — full width, no truncate en mobile */}
            <span className={`
                flex-1 text-sm
                ${isSelected ? 'font-semibold text-foreground' : 'text-muted-foreground'}
            `}>
                {name}
            </span>

            {/* Actions — siempre visible en mobile, hover en desktop */}
            <div
                className="md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
            >
                {actions}
            </div>

            {hasChildren && (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
            )}
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="py-10 text-center text-sm text-muted-foreground">
            {message}
        </div>
    );
}