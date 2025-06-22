import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Claim, ClaimStatus, ClaimLocation, ClaimPriority } from '@/types/claim';

interface ClaimDetailProps {
  claim: Claim;
  onUpdate?: () => void;
}

const ClaimDetail = ({ claim, onUpdate }: ClaimDetailProps) => {
  const { currentUser } = useAuth();
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<ClaimStatus>(claim.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);

  const isAdmin = currentUser?.role === 'BUILDING_ADMIN';

  const handleStatusChange = async (newStatus: ClaimStatus) => {
    if (!isAdmin || !currentUser?.buildingId) return;
    
    setStatus(newStatus);
    
    try {
      setIsUpdating(true);
      await api.patch(`/buildings/${currentUser.buildingId}/claims/${claim.id}/status`, {
        status: newStatus
      });
      toast({
        title: 'Estado actualizado',
        description: 'El estado del reclamo ha sido actualizado',
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al actualizar el estado',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !currentUser?.buildingId) return;
    
    try {
      setIsAddingComment(true);
      await api.post(`/buildings/${currentUser.buildingId}/claims/${claim.id}/comments`, {
        content: comment
      });
      setComment('');
      toast({
        title: 'Comentario agregado',
        description: 'Su comentario ha sido agregado al reclamo',
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al agregar el comentario',
        variant: 'destructive',
      });
    } finally {
      setIsAddingComment(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLocationLabel = (location: ClaimLocation) => {
    const locations: Record<ClaimLocation, string> = {
      [ClaimLocation.UNIT]: 'Unidad',
      [ClaimLocation.COMMON_AREA]: 'Área Común',
      [ClaimLocation.BUILDING]: 'Edificio'
    };
    
    return locations[location] || location;
  };

  const getPriorityLabel = (priority: ClaimPriority) => {
    const priorities: Record<ClaimPriority, string> = {
      [ClaimPriority.LOW]: 'Baja',
      [ClaimPriority.NORMAL]: 'Normal',
      [ClaimPriority.HIGH]: 'Alta',
      [ClaimPriority.URGENT]: 'Urgente'
    };
    
    return priorities[priority] || priority;
  };

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.PENDING:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pendiente</Badge>;
      case ClaimStatus.IN_PROGRESS:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">En Progreso</Badge>;
      case ClaimStatus.RESOLVED:
        return <Badge className="bg-green-100 text-green-800 border-green-300">Resuelto</Badge>;
      case ClaimStatus.CANCELLED:
        return <Badge className="bg-red-100 text-red-800 border-red-300">Cancelado</Badge>;
    }
  };

  const getPriorityBadge = (priority: ClaimPriority) => {
    switch (priority) {
      case ClaimPriority.LOW:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Baja</Badge>;
      case ClaimPriority.NORMAL:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Normal</Badge>;
      case ClaimPriority.HIGH:
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">Alta</Badge>;
      case ClaimPriority.URGENT:
        return <Badge className="bg-red-100 text-red-800 border-red-300">Urgente</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm divide-y">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{claim.title}</h2>
            <div className="mt-2 flex flex-wrap gap-2 items-center text-sm text-consorcio-gray-500">
              <span>Creado: {formatDate(claim.createdAt)}</span>
              <span>•</span>
              <span>Ubicación: {getLocationLabel(claim.location)}</span>
              {claim.location === ClaimLocation.UNIT && claim.unit && (
                <>
                  <span>•</span>
                  <span>Unidad: {claim.unit.number}</span>
                </>
              )}
              <span>•</span>
              <span>Prioridad: {getPriorityBadge(claim.priority)}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-consorcio-gray-500">Estado:</span>
                <Select 
                  value={status} 
                  onValueChange={(value) => handleStatusChange(value as ClaimStatus)}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Cambiar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ClaimStatus.PENDING}>Pendiente</SelectItem>
                    <SelectItem value={ClaimStatus.IN_PROGRESS}>En Progreso</SelectItem>
                    <SelectItem value={ClaimStatus.RESOLVED}>Resuelto</SelectItem>
                    <SelectItem value={ClaimStatus.CANCELLED}>Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              getStatusBadge(claim.status)
            )}
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap text-consorcio-gray-700">{claim.description}</p>
        </div>
        
        {claim.images && claim.images.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Imágenes</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {claim.images.map((imageUrl, index) => (
                <div key={index} className="aspect-video bg-gray-100 rounded overflow-hidden">
                  <img src={imageUrl} alt={`Imagen ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Comentarios</h3>
        
        <div className="space-y-4">
          {claim.comments?.map((comment) => (
            <div key={comment.id} className="bg-consorcio-gray-50 p-4 rounded-lg">
              <p className="text-consorcio-gray-700">{comment.content}</p>
              <p className="text-sm text-consorcio-gray-500 mt-2">
                {formatDate(comment.createdAt)}
              </p>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddComment} className="mt-6">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escribe un comentario..."
            className="min-h-[100px]"
            disabled={isAddingComment}
          />
          <Button
            type="submit"
            className="mt-2"
            disabled={!comment.trim() || isAddingComment}
          >
            {isAddingComment ? 'Enviando...' : 'Enviar Comentario'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ClaimDetail;
