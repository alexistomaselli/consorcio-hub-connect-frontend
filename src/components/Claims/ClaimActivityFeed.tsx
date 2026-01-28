import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ClaimComment, ClaimHistory } from '@/types/claim';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Info,
    MessageSquare,
    History,
    ArrowLeftRight,
    UserPlus,
    PlusCircle,
    AlertTriangle
} from 'lucide-react';

interface Props {
    claimId: string;
    refreshTrigger?: number;
    onItemsLoaded?: (count: number) => void;
}

type TimelineItem = {
    type: 'comment' | 'history';
    id: string;
    createdAt: string;
    data: ClaimComment | ClaimHistory;
};

export const ClaimActivityFeed: React.FC<Props> = ({ claimId, refreshTrigger, onItemsLoaded }) => {
    const [items, setItems] = useState<TimelineItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivity();
    }, [claimId, refreshTrigger]);

    const fetchActivity = async () => {
        setLoading(true);
        try {
            // Fetch comments
            const { data: comments, error: commentsError } = await supabase
                .from('claim_comments')
                .select(`
          *,
          user:users (firstName, lastName, email)
        `)
                .eq('claimId', claimId);

            if (commentsError) throw commentsError;

            // Fetch history
            const { data: history, error: historyError } = await supabase
                .from('claim_history')
                .select(`
          *,
          user:users (firstName, lastName, email)
        `)
                .eq('claimId', claimId);

            if (historyError) throw historyError;

            // Merge and sort
            const combined: TimelineItem[] = [
                ...(comments || []).map(c => ({ type: 'comment' as const, id: c.id, createdAt: c.createdAt, data: c as any })),
                ...(history || []).map(h => ({ type: 'history' as const, id: h.id, createdAt: h.createdAt, data: h as any })),
            ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

            setItems(combined);
            if (onItemsLoaded) onItemsLoaded(combined.length);
        } catch (error) {
            console.error('Error fetching activity:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded">PENDIENTE</span>;
            case 'IN_PROGRESS': return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">EN CURSO</span>;
            case 'RESOLVED': return <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded">RESUELTO</span>;
            case 'CANCELLED': return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded">CANCELADO</span>;
            default: return <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded">{status}</span>;
        }
    };

    if (loading) return <div className="p-4 text-center text-slate-500 text-sm">Cargando actividad...</div>;

    return (
        <ScrollArea className="h-full pr-4">
            <div className="space-y-8 py-4">
                {items.map((item) => {
                    const date = new Date(item.createdAt);
                    const formattedDate = format(date, 'd MMM, HH:mm', { locale: es });
                    const user = item.data.user;
                    const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : '?';

                    return (
                        <div key={item.id} className="flex gap-4">
                            <Avatar className="h-10 w-10 shrink-0 border-2 border-white shadow-sm">
                                <AvatarFallback className="bg-slate-800 text-white font-bold text-xs">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-sm font-bold text-slate-900 leading-none">
                                        {user ? `${user.firstName} ${user.lastName}` : 'Sistema'}
                                    </span>
                                    {item.type === 'comment' && (
                                        <MessageSquare className="h-3 w-3 text-blue-500" />
                                    )}
                                    <span className="text-[11px] text-slate-400 font-medium ml-auto">{formattedDate}</span>
                                </div>

                                {item.type === 'comment' ? (
                                    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 text-sm text-slate-700 leading-relaxed">
                                        {(item.data as ClaimComment).content}
                                        {(item.data as ClaimComment).attachments && (item.data as ClaimComment).attachments!.length > 0 && (
                                            <div className="mt-4 grid grid-cols-2 gap-2">
                                                {(item.data as ClaimComment).attachments!.map((url, i) => (
                                                    <img key={i} src={url} alt="Adjunto" className="rounded-xl border border-slate-200 max-h-60 w-full object-cover hover:opacity-90 transition-opacity cursor-zoom-in" />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-slate-50/80 border border-slate-100/50 rounded-xl p-3 text-sm text-slate-600">
                                        <HistoryEvent item={item.data as ClaimHistory} getStatusBadge={getStatusBadge} />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
                        <Info className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-sm font-medium">No hay actividad registrada</p>
                    </div>
                )}
            </div>
        </ScrollArea>
    );
};

const HistoryEvent = ({ item, getStatusBadge }: { item: ClaimHistory; getStatusBadge: (s: string) => React.ReactNode }) => {
    if (item.changeType === 'status_change') {
        return (
            <div className="flex items-center gap-2 flex-wrap">
                <ArrowLeftRight className="h-3.5 w-3.5 text-blue-500" />
                <span>Cambió el estado de</span>
                {getStatusBadge(item.previousStatus || '')}
                <span className="text-slate-400 mx-1">→</span>
                {getStatusBadge(item.newStatus || '')}
            </div>
        );
    }

    if (item.changeType === 'assignment_change') {
        return (
            <div className="flex items-center gap-2">
                <UserPlus className="h-3.5 w-3.5 text-purple-500" />
                <span>Proveedor asignado: <span className="font-bold text-slate-700">{item.details?.providerName || 'Particular'}</span></span>
            </div>
        );
    }

    if (item.changeType === 'creation') {
        return (
            <div className="flex items-center gap-2">
                <PlusCircle className="h-3.5 w-3.5 text-emerald-500" />
                <span>Ticket creado correctamente</span>
            </div>
        );
    }

    if (item.changeType === 'priority_change') {
        return (
            <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                <span>Cambió la prioridad a <span className="font-bold text-slate-700">{
                    item.newStatus === 'LOW' ? 'Baja' :
                        item.newStatus === 'NORMAL' ? 'Normal' :
                            item.newStatus === 'HIGH' ? 'Alta' : 'Urgente'
                }</span></span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Info className="h-3.5 w-3.5 text-slate-400" />
            <span>{item.details?.message || 'Evento de sistema'}</span>
        </div>
    );
};
