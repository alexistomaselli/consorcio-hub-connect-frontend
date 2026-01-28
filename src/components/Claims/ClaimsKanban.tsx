import React from 'react';
import { Claim, ClaimStatus, ClaimPriority, ClaimLocation } from '@/types/claim';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    XCircle,
    MapPin,
    Calendar
} from 'lucide-react';

interface ClaimsKanbanProps {
    claims: Claim[];
    onClaimClick: (claim: Claim) => void;
}

export const ClaimsKanban: React.FC<ClaimsKanbanProps> = ({ claims, onClaimClick }) => {
    const columns = [
        {
            id: ClaimStatus.PENDING,
            title: 'Pendiente',
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200'
        },
        {
            id: ClaimStatus.IN_PROGRESS,
            title: 'En Progreso',
            icon: AlertCircle,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200'
        },
        {
            id: ClaimStatus.RESOLVED,
            title: 'Resuelto',
            icon: CheckCircle2,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200'
        },
        {
            id: ClaimStatus.CANCELLED,
            title: 'Cancelado',
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200'
        }
    ];

    const getPriorityBadge = (priority: ClaimPriority) => {
        switch (priority) {
            case ClaimPriority.URGENT:
                return <Badge className="bg-red-600 hover:bg-red-700">Urgente</Badge>;
            case ClaimPriority.HIGH:
                return <Badge className="bg-orange-500 hover:bg-orange-600">Alta</Badge>;
            case ClaimPriority.NORMAL:
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Normal</Badge>;
            case ClaimPriority.LOW:
                return <Badge variant="outline" className="text-slate-600">Baja</Badge>;
            default:
                return null;
        }
    };

    const getLocationText = (claim: Claim) => {
        if (claim.location === ClaimLocation.UNIT && claim.unit) {
            return `Unidad ${claim.unit.floor || ''}-${claim.unit.number}`;
        }
        if (claim.location === ClaimLocation.COMMON_AREA && claim.space) {
            return claim.space.name;
        }
        return claim.locationDetail || 'Ubicación n/a';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short'
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 h-[calc(100vh-250px)] min-h-[500px]">
            {columns.map(column => {
                const columnClaims = claims.filter(c => c.status === column.id);
                const Icon = column.icon;

                return (
                    <div key={column.id} className="flex flex-col h-full bg-slate-50/50 rounded-lg border border-slate-200 overflow-hidden">
                        {/* Column Header */}
                        <div className={`p-4 border-b ${column.borderColor} ${column.bgColor} flex justify-between items-center`}>
                            <div className="flex items-center gap-2">
                                <Icon className={`w-5 h-5 ${column.color}`} />
                                <h3 className={`font-semibold ${column.color}`}>{column.title}</h3>
                            </div>
                            <Badge variant="secondary" className="bg-white/50 text-slate-600">
                                {columnClaims.length}
                            </Badge>
                        </div>

                        {/* Column Content */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="flex flex-col gap-3">
                                {columnClaims.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 text-sm italic">
                                        No hay reclamos
                                    </div>
                                ) : (
                                    columnClaims.map(claim => (
                                        <Card
                                            key={claim.id}
                                            className="cursor-pointer hover:shadow-md transition-shadow border-slate-200"
                                            onClick={() => onClaimClick(claim)}
                                        >
                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h4 className="font-medium text-slate-800 line-clamp-2 leading-tight">
                                                        {claim.title}
                                                    </h4>
                                                    {getPriorityBadge(claim.priority)}
                                                </div>

                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <MapPin className="w-3 h-3" />
                                                    <span className="truncate max-w-[150px]">{getLocationText(claim)}</span>
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(claim.createdAt)}
                                                    </div>

                                                    {/* Avatar placeholder or user initials could go here */}
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                        {claim.creator?.firstName?.[0] || 'U'}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                );
            })}
        </div>
    );
};
