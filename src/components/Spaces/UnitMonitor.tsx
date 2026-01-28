
import React, { useState, useMemo } from 'react';
import { UnitStatusCard, UnitStatusData, UnitStatusType, PaymentStatusType } from './UnitStatusCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, Filter, RefreshCw, LayoutGrid, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UnitMonitorProps {
    spaces: any[]; // Using any[] to match the flexible Space interface from parent, but identifying units
    isLoading: boolean;
}

export default function UnitMonitor({ spaces, isLoading }: UnitMonitorProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'debt' | 'claims' | 'occupied' | 'available'>('all');

    // Generate Mock Data derived from actual spaces
    // This memo basically "hydrates" the blank unit list with fake status data
    const unitsWithStatus: UnitStatusData[] = useMemo(() => {
        // Filter only Unit type spaces
        const units = spaces.filter(s => s.type?.name === 'Unidad' || s.name.match(/^\d+$/) || s.name.match(/^[A-Z]\d+$/));

        // Deterministic pseudo-random based on ID to keep status stable during re-renders but random-looking
        return units.map(unit => {
            const hash = unit.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);

            const statuses: UnitStatusType[] = ['occupied', 'occupied', 'occupied', 'available', 'tenant'];
            const status = statuses[hash % statuses.length];

            const paymentStatus: PaymentStatusType = (hash % 5 === 0) ? 'debt' : 'paid'; // 20% chance of debt
            const activeClaims = (hash % 7 === 0) ? Math.floor((hash % 3) + 1) : 0; // ~15% chance of claims

            return {
                id: unit.id,
                name: unit.name,
                floor: unit.floor || unit.name.replace(/\D/g, '').charAt(0) || '0', // Guess floor if missing
                status,
                paymentStatus,
                activeClaims
            };
        });
    }, [spaces]);

    const filteredUnits = useMemo(() => {
        return unitsWithStatus.filter(unit => {
            const matchesSearch = unit.name.toLowerCase().includes(searchTerm.toLowerCase());

            if (!matchesSearch) return false;

            switch (statusFilter) {
                case 'debt': return unit.paymentStatus === 'debt';
                case 'claims': return unit.activeClaims > 0;
                case 'occupied': return unit.status === 'occupied' || unit.status === 'tenant';
                case 'available': return unit.status === 'available';
                default: return true;
            }
        });
    }, [unitsWithStatus, searchTerm, statusFilter]);

    // Group units by floor
    const groupedUnits = useMemo(() => {
        const groups: Record<string, typeof filteredUnits> = {};
        filteredUnits.forEach((unit) => {
            const floor = unit.floor || 'Sin Piso';
            if (!groups[floor]) {
                groups[floor] = [];
            }
            groups[floor].push(unit);
        });
        return groups;
    }, [filteredUnits]);

    // Sort floors logically
    const sortedFloors = useMemo(() => {
        return Object.keys(groupedUnits).sort((a, b) => {
            // Handle special cases
            if (a === 'PB') return b === 'Subsuelo' ? 1 : -1;
            if (b === 'PB') return a === 'Subsuelo' ? -1 : 1;
            if (a === 'Subsuelo') return -1;
            if (b === 'Subsuelo') return 1;
            if (a === 'Sin Piso') return 1;
            if (b === 'Sin Piso') return -1;

            // Try to parse numbers
            const numA = parseInt(a);
            const numB = parseInt(b);

            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }

            return a.localeCompare(b);
        });
    }, [groupedUnits]);

    // Statistics for the sub-header
    const stats = useMemo(() => {
        return {
            total: unitsWithStatus.length,
            occupied: unitsWithStatus.filter(u => u.status !== 'available').length,
            debt: unitsWithStatus.filter(u => u.paymentStatus === 'debt').length,
            activeClaims: unitsWithStatus.reduce((acc, curr) => acc + curr.activeClaims, 0)
        };
    }, [unitsWithStatus]);

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Cargando monitor de estados...</div>;
    }

    if (spaces.length === 0) {
        return <div className="p-8 text-center text-muted-foreground">No hay unidades configuradas para monitorear.</div>;
    }

    return (
        <div className="space-y-6">
            {/* Quick Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ocupación</p>
                    <div className="flex items-baseline mt-2 gap-2">
                        <span className="text-2xl font-bold">{Math.round((stats.occupied / stats.total) * 100)}%</span>
                        <span className="text-sm text-muted-foreground">({stats.occupied}/{stats.total})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 mt-2 rounded-full overflow-hidden">
                        <div className="bg-slate-800 h-full rounded-full" style={{ width: `${(stats.occupied / stats.total) * 100}%` }}></div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Morosidad</p>
                    <div className="flex items-baseline mt-2 gap-2">
                        <span className="text-2xl font-bold text-rose-600">{stats.debt}</span>
                        <span className="text-sm text-muted-foreground">Unidades</span>
                    </div>
                    <p className="text-xs text-rose-600/80 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Requiere atención
                    </p>
                </div>

                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reclamos Activos</p>
                    <div className="flex items-baseline mt-2 gap-2">
                        <span className="text-2xl font-bold text-orange-600">{stats.activeClaims}</span>
                        <span className="text-sm text-muted-foreground">Pendientes</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Tiempo prom: 2.4 días
                    </p>
                </div>
            </div>

            {/* Filters Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar unidad..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <Button
                        variant={statusFilter === 'all' ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setStatusFilter('all')}
                        className="whitespace-nowrap"
                    >
                        Todas
                    </Button>
                    <Button
                        variant={statusFilter === 'occupied' ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setStatusFilter('occupied')}
                        className="whitespace-nowrap gap-1"
                    >
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Ocupadas
                    </Button>
                    <Button
                        variant={statusFilter === 'available' ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setStatusFilter('available')}
                        className="whitespace-nowrap gap-1"
                    >
                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                        Disponibles
                    </Button>
                    <Button
                        variant={statusFilter === 'debt' ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setStatusFilter('debt')}
                        className="whitespace-nowrap gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    >
                        <AlertCircle className="w-3.5 h-3.5" />
                        Con Deuda
                    </Button>
                    <Button
                        variant={statusFilter === 'claims' ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setStatusFilter('claims')}
                        className="whitespace-nowrap gap-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    >
                        <AlertCircle className="w-3.5 h-3.5" />
                        Con Reclamos
                    </Button>
                </div>
            </div>

            {/* Grouped Unit Grid */}
            <div className="space-y-8">
                {sortedFloors.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No se encontraron unidades que coincidan con los filtros.</p>
                    </div>
                ) : (
                    sortedFloors.map((floor) => {
                        const units = groupedUnits[floor];
                        const displayFloor = floor === 'PB' ? 'Planta Baja' : `Piso ${floor}`;
                        const floorInitial = floor === 'PB' ? 'PB' : floor.replace('Piso ', '');

                        return (
                            <div key={floor} className="space-y-4">
                                {/* Floor Header */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                                            {floorInitial}
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-800">{displayFloor}</h3>
                                    </div>
                                    <div className="h-px flex-1 bg-slate-100"></div>
                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                                        {units.length} {units.length === 1 ? 'Unidad' : 'Unidades'}
                                    </span>
                                </div>

                                {/* Units Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {units.map((unit) => (
                                        <UnitStatusCard
                                            key={unit.id}
                                            unit={unit}
                                            onClick={() => console.log('Click unit', unit)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
