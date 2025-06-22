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
import { useToast } from "@/components/ui/use-toast";
import { OwnerService } from '@/services/owners';

interface InviteOwnerModalProps {
  buildingId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteOwnerModal({ buildingId, open, onClose, onSuccess }: InviteOwnerModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    whatsappNumber: '',
    unitNumber: '',
  });

  // Validar número de WhatsApp
  const validateWhatsAppNumber = (number: string): boolean => {
    // Formato: +[código de país][número]
    const whatsappRegex = /^\+[1-9]\d{1,14}$/;
    return whatsappRegex.test(number);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar número de WhatsApp
    if (!validateWhatsAppNumber(formData.whatsappNumber)) {
      toast({
        title: "Error",
        description: "El número de WhatsApp debe incluir el código de país (ej: +5491112345678)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await OwnerService.inviteOwner(buildingId, formData);
      
      toast({
        title: "Invitación enviada",
        description: response.message || "Se ha enviado la invitación al propietario por WhatsApp.",
      });
      
      // Limpiar formulario
      setFormData({
        firstName: '',
        lastName: '',
        whatsappNumber: '',
        unitNumber: '',
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo enviar la invitación. Por favor, intente nuevamente.",
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
          <DialogTitle>Invitar Propietario</DialogTitle>
          <DialogDescription>
            Ingrese los datos del propietario para enviarle una invitación por WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                placeholder="Juan"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                placeholder="Pérez"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">Número de WhatsApp</Label>
            <Input
              id="whatsappNumber"
              placeholder="+5491112345678"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitNumber">Número de Unidad</Label>
            <Input
              id="unitNumber"
              placeholder="1-A"
              value={formData.unitNumber}
              onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar Invitación"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
