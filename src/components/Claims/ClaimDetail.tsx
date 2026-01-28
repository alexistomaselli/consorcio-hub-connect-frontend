import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { uploadFiles } from '@/lib/storage';
import { Claim, ClaimStatus, ClaimLocation, ClaimPriority } from '@/types/claim';
import { ClaimActivityFeed } from './ClaimActivityFeed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  History,
  MessageSquare,
  Calendar,
  MapPin,
  AlertCircle,
  User,
  Wrench,
  Camera,
  Send,
  X,
  Paperclip,
  ChevronRight,
  Clock,
  Shield,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ClaimDetailProps {
  claim: Claim;
  onUpdate?: () => void;
}

const ClaimDetail = ({ claim, onUpdate }: ClaimDetailProps) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [serviceProviders, setServiceProviders] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [eventCount, setEventCount] = useState(0);

  // Image handling for comments
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const isAdmin = currentUser?.role === 'BUILDING_ADMIN' || currentUser?.role === 'SUPER_ADMIN';
  const isProvider = currentUser?.role === 'SERVICE_PROVIDER' && (claim.serviceProviderId === currentUser?.id || (claim.serviceProvider as any)?.id === currentUser?.id);
  const isCreator = currentUser?.id === claim.creatorId;
  const canChangeStatus = isAdmin || isProvider || isCreator;

  useEffect(() => {
    if (isAdmin) {
      fetchServiceProviders();
    }
  }, [isAdmin]);

  const fetchServiceProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('id, businessName');
      if (error) throw error;
      setServiceProviders(data || []);
    } catch (error) {
      console.error('Error fetching service providers:', error);
    }
  };

  const handleStatusChange = async (newStatus: ClaimStatus) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('claims')
        .update({ status: newStatus })
        .eq('id', claim.id);

      if (error) throw error;

      toast.success('Estado actualizado correctamente');
      setRefreshTrigger(prev => prev + 1);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
      toast.error('Ocurrió un error al actualizar el estado');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignmentChange = async (providerId: string) => {
    try {
      setIsUpdating(true);
      const selectedProvider = serviceProviders.find(p => p.id === providerId);
      const providerName = selectedProvider ? (selectedProvider.businessName || selectedProvider.name) : 'Particular';

      const { error } = await supabase
        .from('claims')
        .update({ serviceProviderId: providerId === 'none' ? null : providerId })
        .eq('id', claim.id);

      if (error) throw error;

      toast.success('Proveedor asignado correctamente');
      setRefreshTrigger(prev => prev + 1);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error al asignar proveedor:', error);
      toast.error('Ocurrió un error al asignar el proveedor');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority: ClaimPriority) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('claims')
        .update({ priority: newPriority })
        .eq('id', claim.id);

      if (error) throw error;

      toast.success('Prioridad actualizada');
      setRefreshTrigger(prev => prev + 1);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error al actualizar la prioridad:', error);
      toast.error('Error al actualizar la prioridad');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() && selectedFiles.length === 0) return;

    try {
      setIsAddingComment(true);

      // Real image upload logic
      let uploadedUrls: string[] = [];
      if (selectedFiles.length > 0) {
        try {
          uploadedUrls = await uploadFiles('claims', `comments/${claim.id}`, selectedFiles);
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          toast.error('Error al subir imágenes, el comentario se enviará sin ellas');
        }
      }

      const { error } = await supabase
        .from('claim_comments')
        .insert({
          claimId: claim.id,
          userId: currentUser?.id,
          content: comment,
          attachments: uploadedUrls
        });

      if (error) throw error;

      setComment('');
      setSelectedFiles([]);
      setPreviewUrls([]);
      toast.success('Comentario enviado');
      setRefreshTrigger(prev => prev + 1);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      toast.error('Error al enviar el comentario');
    } finally {
      setIsAddingComment(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.PENDING: return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendiente</Badge>;
      case ClaimStatus.IN_PROGRESS: return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En Progreso</Badge>;
      case ClaimStatus.RESOLVED: return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resuelto</Badge>;
      case ClaimStatus.CANCELLED: return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelado</Badge>;
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-6">
      {/* Back Button and Header */}
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {getStatusBadge(claim.status)}
            {claim.priority !== 'NORMAL' && (
              <Badge variant="outline" className={`text-[10px] font-bold uppercase ${claim.priority === 'HIGH' || claim.priority === 'URGENT' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                }`}>
                {claim.priority === 'LOW' ? 'Baja' : 'Prioridad Alta'}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
              {claim.title || 'Detalle del Reclamo'}
            </h1>
          </div>
          <p className="text-slate-400 text-sm flex items-center gap-2">
            Ticket #{claim.id.slice(0, 8)}
          </p>
        </div>
      </div>

      {/* Action Bar (K-Tracker style) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 px-2 border-r pr-4">
          <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <History className="h-4 w-4 text-blue-600" />
          </div>
          {canChangeStatus ? (
            <Select
              value={claim.status}
              onValueChange={(v) => handleStatusChange(v as ClaimStatus)}
              disabled={isUpdating}
            >
              <SelectTrigger className="h-10 min-w-[140px] border-none shadow-none focus:ring-0 p-0 hover:bg-slate-50 rounded-xl transition-all group">
                <div className="flex items-center gap-2 px-2">
                  <div className="group-hover:scale-110 transition-transform">
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin text-blue-600" /> : getStatusBadge(claim.status)}
                  </div>
                  <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING" className="font-bold">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-400" /> Pendiente
                  </div>
                </SelectItem>
                <SelectItem value="IN_PROGRESS" className="font-bold">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" /> En Progreso
                  </div>
                </SelectItem>
                <SelectItem value="RESOLVED" className="font-bold">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" /> Resuelto
                  </div>
                </SelectItem>
                <SelectItem value="CANCELLED" className="font-bold">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" /> Cancelado
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="px-3">{getStatusBadge(claim.status)}</div>
          )}
        </div>

        <div className="flex items-center gap-2 px-2 border-r pr-4">
          <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
            <User className="h-4 w-4 text-purple-600" />
          </div>
          {isAdmin ? (
            <Select
              value={claim.serviceProviderId || 'none'}
              onValueChange={handleAssignmentChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="h-10 min-w-[180px] border-none shadow-none focus:ring-0 font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2">
                  {isUpdating && <Loader2 className="h-3 w-3 animate-spin text-purple-600 mr-1" />}
                  <SelectValue placeholder="Sin asignar" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="font-bold text-slate-400">Sin asignar</SelectItem>
                {serviceProviders.map(sp => (
                  <SelectItem key={sp.id} value={sp.id} className="font-bold">{sp.businessName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="px-3 py-2 font-bold text-slate-700 truncate max-w-[150px]">
              {(claim.serviceProvider as any)?.businessName || claim.serviceProvider?.name || 'Sin asignar'}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 px-2">
          <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center">
            <Clock className="h-4 w-4 text-orange-600" />
          </div>
          {isAdmin ? (
            <Select
              value={claim.priority}
              onValueChange={(v) => handlePriorityChange(v as ClaimPriority)}
              disabled={isUpdating}
            >
              <SelectTrigger className="h-10 min-w-[100px] border-none shadow-none focus:ring-0 font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2">
                  {isUpdating && <Loader2 className="h-3 w-3 animate-spin text-orange-600 mr-1" />}
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW" className="font-bold text-slate-500">Baja</SelectItem>
                <SelectItem value="NORMAL" className="font-bold text-slate-600">Normal</SelectItem>
                <SelectItem value="HIGH" className="font-bold text-red-500">Alta</SelectItem>
                <SelectItem value="URGENT" className="font-bold text-red-700">Urgente</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="px-3 py-2 font-bold text-slate-700 text-sm">
              {claim.priority === 'LOW' ? 'Baja' :
                claim.priority === 'NORMAL' ? 'Normal' :
                  claim.priority === 'HIGH' ? 'Alta' : 'Urgente'}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content: Description and Activity */}
        <div className="flex-1 space-y-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                Detalle del Reclamo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {claim.description}
              </p>

              {claim.images && claim.images.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {claim.images.map((url, i) => (
                    <img key={i} src={url} alt="Evidencia" className="rounded-2xl border border-slate-200 h-48 w-full object-cover shadow-sm hover:ring-2 hover:ring-blue-100 transition-all cursor-zoom-in" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-[750px] shadow-sm">
            <div className="px-6 py-4 border-b bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <History className="h-5 w-5 text-blue-500" />
                  Actividad y Mensajes
                </h3>
                <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-bold text-[10px] h-5 px-1.5">
                  {eventCount} eventos
                </Badge>
              </div>
            </div>
            <div className="flex-1 overflow-hidden min-h-0 relative">
              <div className="absolute inset-0 p-6 overflow-hidden">
                <ClaimActivityFeed
                  claimId={claim.id}
                  refreshTrigger={refreshTrigger}
                  onItemsLoaded={setEventCount}
                />
              </div>
            </div>

            {/* Comment Input (k-tracker style) */}
            <div className="p-4 border-t bg-white">
              <form onSubmit={handleAddComment} className="flex flex-col gap-3">
                <div className="flex gap-3 items-start">
                  <Avatar className="h-10 w-10 shrink-0 border-2 border-white shadow-sm">
                    <AvatarFallback className="bg-slate-200 text-slate-600 font-bold text-xs">
                      {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Escribe un comentario o actualización..."
                      className="w-full min-h-[100px] border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment(e);
                        }
                      }}
                    />

                    {previewUrls.length > 0 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                        {previewUrls.map((url, i) => (
                          <div key={i} className="relative h-16 w-16 flex-shrink-0">
                            <img src={url} className="h-full w-full object-cover rounded-md border shadow-sm" />
                            <button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-3">
                      <label className="cursor-pointer p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
                        <Paperclip className="h-5 w-5" />
                      </label>
                      <Button
                        type="submit"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 h-9 rounded-lg font-medium transition-all shadow-sm flex items-center gap-2"
                        disabled={isAddingComment || (!comment.trim() && selectedFiles.length === 0)}
                      >
                        {isAddingComment ? 'Enviando...' : (
                          <>
                            <Send className="h-4 w-4" /> Comentar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar: Context Details (K-Tracker style) */}
        <div className="w-full lg:w-80 space-y-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Detalles del Contexto
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Fecha de Alta</p>
                  <p className="text-sm font-bold text-slate-700">{formatDate(claim.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Solicitante</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6 border border-white shadow-sm">
                      <AvatarFallback className="bg-slate-800 text-white text-[10px] font-bold">
                        {claim.creator?.firstName?.[0]}{claim.creator?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-bold text-slate-700 truncate">
                      {claim.creator ? `${claim.creator.firstName} ${claim.creator.lastName}` : 'Anónimo'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Ubicación</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">
                    {claim.location === 'UNIT' ? `Unidad ${claim.unit?.number || ''}` :
                      claim.location === 'COMMON_AREA' ? `Área: ${claim.space?.name || claim.locationDetail || ''}` :
                        'Edificio (Gral)'}
                  </p>
                  <Badge variant="secondary" className="text-[9px] font-bold h-4 px-1.5 mt-1 bg-slate-100 text-slate-500 border-none">
                    {claim.location === 'UNIT' ? 'UNIDAD' :
                      claim.location === 'COMMON_AREA' ? 'ESPACIO COMÚN' : 'EDIFICIO'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Prioridad</p>
                  <p className={`text-sm font-bold mt-1 ${claim.priority === 'URGENT' ? 'text-red-700' :
                    claim.priority === 'HIGH' ? 'text-red-600' :
                      'text-slate-700'
                    }`}>
                    {claim.priority === 'LOW' ? 'Baja' :
                      claim.priority === 'NORMAL' ? 'Normal' :
                        claim.priority === 'HIGH' ? 'Alta' : 'Urgente'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Card (K-Tracker style) */}
          <Card className="bg-slate-900 border-none shadow-xl overflow-hidden rounded-2xl text-white">
            <CardContent className="p-6 space-y-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Progreso del Reclamo</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black italic tracking-tighter">
                  {claim.status === 'RESOLVED' ? '100' :
                    claim.status === 'IN_PROGRESS' ? '50' :
                      claim.status === 'CANCELLED' ? '0' : '10'}
                </span>
                <span className="text-xl font-bold text-slate-500">%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-1000"
                  style={{ width: `${claim.status === 'RESOLVED' ? 100 : claim.status === 'IN_PROGRESS' ? 50 : 10}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {claim.status === 'RESOLVED' ? '¡Excelente! Este reclamo ha sido resuelto.' :
                  claim.status === 'IN_PROGRESS' ? 'El reclamo está siendo atendido.' :
                    'El reclamo está pendiente de atención.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClaimDetail;
