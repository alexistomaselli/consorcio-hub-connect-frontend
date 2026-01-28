import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabase';
import { InvitationRole } from '@/types';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Plus, Loader2 } from "lucide-react";

interface CreateInvitationDialogProps {
    buildingId: string;
    onSuccess?: () => void;
    existingInvitations: { unitId: string; role: InvitationRole; isResident: boolean }[];
}

interface Unit {
    id: string;
    number: string;
    floor: string;
}

type InvitationType = 'OWNER_NON_RESIDENT' | 'OWNER_RESIDENT' | 'TENANT';

export function CreateInvitationDialog({ buildingId, onSuccess, existingInvitations }: CreateInvitationDialogProps) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [units, setUnits] = useState<Unit[]>([]);
    const [formData, setFormData] = useState({
        email: '',
        type: 'OWNER_NON_RESIDENT' as InvitationType,
        selectedUnitIds: [] as string[],
    });

    useEffect(() => {
        if (open && buildingId) {
            fetchUnits();
        }
    }, [open, buildingId]);

    const fetchUnits = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('units')
                .select('id, number, floor')
                .eq('buildingId', buildingId)
                .order('number');

            if (error) throw error;
            setUnits(data || []);
        } catch (error) {
            console.error('Error fetching units:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las unidades.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnitToggle = (unitId: string) => {
        setFormData(prev => {
            if (prev.selectedUnitIds.includes(unitId)) {
                return { ...prev, selectedUnitIds: prev.selectedUnitIds.filter(id => id !== unitId) };
            } else {
                return { ...prev, selectedUnitIds: [...prev.selectedUnitIds, unitId] };
            }
        });
    };

    const getUnitStatus = (unitId: string) => {
        const selectedType = formData.type;
        const requiresOwnerSlot = selectedType === 'OWNER_NON_RESIDENT' || selectedType === 'OWNER_RESIDENT';
        const requiresResidentSlot = selectedType === 'TENANT' || selectedType === 'OWNER_RESIDENT';

        // Check if slots are taken by existing invitations for this unit
        const existingForUnit = existingInvitations.filter(inv => inv.unitId === unitId);

        let ownerTaken = false;
        let residentTaken = false;

        existingForUnit.forEach(inv => {
            if (inv.role === InvitationRole.OWNER) ownerTaken = true;
            if (inv.isResident) residentTaken = true;
        });

        if (requiresOwnerSlot && ownerTaken) return { disabled: true, reason: 'Ya tiene Propietario' };
        if (requiresResidentSlot && residentTaken) return { disabled: true, reason: 'Ya tiene Residente' };

        return { disabled: false, reason: '' };
    };

    // Clear selection if type changes and selected unit becomes invalid
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            selectedUnitIds: prev.selectedUnitIds.filter(id => !getUnitStatus(id).disabled)
        }));
    }, [formData.type, units]); // Run when type changes or units load

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.selectedUnitIds.length === 0) {
            toast({ title: "Atención", description: "Seleccione al menos una unidad.", variant: "destructive" });
            return;
        }

        setIsSending(true);
        let successCount = 0;
        let errorCount = 0;

        try {
            // Determine role and isResident based on type
            let role: InvitationRole = InvitationRole.OWNER;
            let isResident = false;

            switch (formData.type) {
                case 'OWNER_NON_RESIDENT':
                    role = InvitationRole.OWNER;
                    isResident = false;
                    break;
                case 'OWNER_RESIDENT':
                    role = InvitationRole.OWNER;
                    isResident = true;
                    break;
                case 'TENANT':
                    role = InvitationRole.RESIDENT; // Assuming tenant maps to RESIDENT role
                    isResident = true;
                    break;
            }

            for (const unitId of formData.selectedUnitIds) {
                try {
                    const expiresAt = new Date();
                    expiresAt.setDate(expiresAt.getDate() + 7);
                    const token = crypto.randomUUID();

                    const { data: invitation, error } = await supabase
                        .from('platform_invitations')
                        .insert({
                            buildingId,
                            unitId,
                            email: formData.email,
                            role,
                            isResident,
                            token: token,
                            expiresAt: expiresAt.toISOString(),
                            status: 'PENDING',
                            updatedAt: new Date().toISOString()
                        })
                        .select()
                        .single();

                    if (error) throw error;

                    const unitNumber = units.find(u => u.id === unitId)?.number || 'Unidad';

                    // Trigger email
                    await supabase.functions.invoke('send-email', {
                        body: {
                            email: invitation.email,
                            token: invitation.token,
                            role: invitation.role,
                            isResident: invitation.isResident,
                            buildingName: 'ConsorcioHub', // Ideally fetch building name
                            unitNumber: unitNumber,
                        },
                    });

                    successCount++;
                } catch (err) {
                    console.error(`Failed to invite to unit ${unitId}`, err);
                    errorCount++;
                }
            }

            if (successCount > 0) {
                toast({
                    title: "Invitaciones Enviadas",
                    description: `Se enviaron ${successCount} invitaciones exitosamente.${errorCount > 0 ? ` Fallaron ${errorCount}.` : ''}`,
                });
                setOpen(false);
                setFormData({
                    email: '',
                    type: 'OWNER_NON_RESIDENT',
                    selectedUnitIds: []
                });
                onSuccess?.();
            } else if (errorCount > 0) {
                toast({
                    title: "Error",
                    description: "No se pudieron enviar las invitaciones. Intente nuevamente.",
                    variant: "destructive",
                });
            }

        } catch (error) {
            toast({
                title: "Error Genérico",
                description: "Ocurrió un error al procesar las solicitudes.",
                variant: "destructive",
            });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Invitación
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invitar Usuario</DialogTitle>
                    <DialogDescription>
                        Envíe una invitación por correo electrónico para una o más unidades.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="usuario@ejemplo.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Tipo de Usuario</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(val: InvitationType) => setFormData({ ...formData, type: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="OWNER_NON_RESIDENT">Propietario (No Reside)</SelectItem>
                                <SelectItem value="OWNER_RESIDENT">Propietario y Residente</SelectItem>
                                <SelectItem value="TENANT">Inquilino / Residente</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Unidades</Label>
                        <ScrollArea className="h-[200px] border rounded-md p-2">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {units.map((unit) => {
                                        const { disabled, reason } = getUnitStatus(unit.id);
                                        return (
                                            <div key={unit.id} className={`flex items-center space-x-2 ${disabled ? 'opacity-50' : ''}`} title={reason}>
                                                <Checkbox
                                                    id={unit.id}
                                                    checked={formData.selectedUnitIds.includes(unit.id)}
                                                    onCheckedChange={() => handleUnitToggle(unit.id)}
                                                    disabled={disabled}
                                                />
                                                <Label
                                                    htmlFor={unit.id}
                                                    className="text-sm font-normal cursor-pointer"
                                                >
                                                    {unit.number} {disabled && <span className="text-xs text-red-500">({reason})</span>}
                                                </Label>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </ScrollArea>
                        <p className="text-xs text-muted-foreground">
                            Seleccione las unidades a vincular. Las unidades no disponibles ya tienen asignado ese rol.
                        </p>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSending}>
                            {isSending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                "Enviar Invitación"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
