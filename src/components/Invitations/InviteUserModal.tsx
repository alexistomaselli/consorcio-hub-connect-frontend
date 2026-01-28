import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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

interface InviteUserModalProps {
    buildingId: string;
    unitId?: string; // Optional if we want to select unit in modal
    unitNumber?: string; // For display
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function InviteUserModal({
    buildingId,
    unitId,
    unitNumber,
    open,
    onClose,
    onSuccess
}: InviteUserModalProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        role: InvitationRole.OWNER,
        // Add unit selection logic if unitId is not provided
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!unitId) {
            toast({ title: "Error", description: "Unit ID is missing", variant: "destructive" });
            return;
        }

        setIsLoading(true);
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
                    role: formData.role,
                    token: token,
                    expiresAt: expiresAt.toISOString(),
                    status: 'PENDING',
                    updatedAt: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            // Trigger email
            supabase.functions.invoke('send-email', {
                body: {
                    email: invitation.email,
                    token: invitation.token,
                    isResident: invitation.isResident,
                    buildingName: 'ConsorcioHub',
                    unitNumber: unitNumber || 'Unidad',
                },
            }).catch(err => console.error('Email trigger failed:', err));

            toast({
                title: "Invitation Sent",
                description: `Invitation sent to ${formData.email} for Unit ${unitNumber}.`,
            });

            setFormData({ ...formData, email: '' });
            onSuccess?.();
            onClose();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to send invitation.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite {unitNumber ? `for Unit ${unitNumber}` : 'User'}</DialogTitle>
                    <DialogDescription>
                        Send an email invitation to a new Owner or Resident.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="user@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={formData.role}
                            onValueChange={(val: InvitationRole) => setFormData({ ...formData, role: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={InvitationRole.OWNER}>Owner (Propietario)</SelectItem>
                                <SelectItem value={InvitationRole.RESIDENT}>Resident (Inquilino/Habitante)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" type="button" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Sending..." : "Send Invite"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
