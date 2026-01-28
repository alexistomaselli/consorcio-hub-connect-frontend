
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AlertCircle,
    CheckCircle2,
    FileText,
    MoreVertical,
    Wallet,
    MessageSquare,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type UnitStatusType = 'occupied' | 'available' | 'tenant';
export type PaymentStatusType = 'paid' | 'debt';

export interface UnitStatusData {
    id: string;
    name: string;
    floor: string;
    status: UnitStatusType;
    paymentStatus: PaymentStatusType;
    activeClaims: number;
}

interface UnitStatusCardProps {
    unit: UnitStatusData;
    onClick?: () => void;
}

export function UnitStatusCard({ unit, onClick }: UnitStatusCardProps) {

    const getStatusBadge = (status: UnitStatusType) => {
        switch (status) {
            case 'occupied':
                return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-medium">Ocupada</Badge>;
            case 'available':
                return <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-none font-medium">Disponible</Badge>;
            case 'tenant':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none font-medium">Inquilino</Badge>;
        }
    };

    return (
        <Card className="p-4 bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 group">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unidad</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 leading-none mt-1">{unit.name}</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">Piso {unit.floor}</p>
                </div>
                {getStatusBadge(unit.status)}
            </div>

            {/* Indicators */}
            <div className="space-y-3 mb-5">

                {/* Expenses Status */}
                <div className="flex items-center justify-between p-2 rounded-md bg-slate-50/50">
                    <div className="flex items-center gap-2 text-slate-600">
                        <Wallet className="h-4 w-4" />
                        <span className="text-sm font-medium">Expensas</span>
                    </div>
                    {unit.paymentStatus === 'paid' ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-semibold">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Al día
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2 py-1 rounded text-xs font-semibold">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Deuda
                        </div>
                    )}
                </div>

                {/* Claims Status */}
                <div className="flex items-center justify-between p-2 rounded-md bg-slate-50/50">
                    <div className="flex items-center gap-2 text-slate-600">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm font-medium">Reclamos</span>
                    </div>
                    {unit.activeClaims === 0 ? (
                        <div className="text-slate-400 text-xs font-medium px-2">
                            Sin activos
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs font-semibold">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {unit.activeClaims} {unit.activeClaims === 1 ? 'Activo' : 'Activos'}
                        </div>
                    )}
                </div>

            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-100">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs font-medium border-slate-200 text-slate-600 hover:text-primary hover:border-primary/30"
                    onClick={onClick}
                >
                    Ver Detalles
                    <ArrowRight className="ml-1.5 h-3 w-3 opacity-50" />
                </Button>

                <div className="flex gap-1">
                    {unit.activeClaims > 0 && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-orange-500 hover:bg-orange-50">
                            <MessageSquare className="h-4 w-4" />
                        </Button>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onClick}>Ver Perfil de Unidad</DropdownMenuItem>
                            <DropdownMenuItem>Ver Estado de Cuenta</DropdownMenuItem>
                            <DropdownMenuItem>Gestionar Reclamos</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </Card>
    );
}
