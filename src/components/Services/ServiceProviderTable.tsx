import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ServiceProvider {
  id: string;
  name: string;
  description: string | null;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  rating: number;
  status: 'UNVERIFIED' | 'VERIFIED' | 'REJECTED';
  serviceTypes: Array<{
    id: string;
    name: string;
  }>;
}

interface ServiceProviderTableProps {
  providers: ServiceProvider[];
  onEdit: (provider: ServiceProvider) => void;
  onDelete: (provider: ServiceProvider) => void;
  onVerify: (provider: ServiceProvider) => void;
}

const ServiceProviderTable: React.FC<ServiceProviderTableProps> = ({
  providers,
  onEdit,
  onDelete,
  onVerify,
}) => {
  const getStatusBadge = (status: ServiceProvider['status']) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge className="bg-green-500">Verificado</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rechazado</Badge>;
      default:
        return <Badge variant="secondary">Pendiente</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Servicios</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.map((provider) => (
            <TableRow key={provider.id}>
              <TableCell className="font-medium">
                <div>
                  {provider.name}
                  {provider.description && (
                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {provider.serviceTypes.map((type) => (
                    <Badge key={type.id} variant="outline">
                      {type.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm">{provider.email}</div>
                  <div className="text-sm text-muted-foreground">{provider.phone}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm">{provider.city}</div>
                  <div className="text-sm text-muted-foreground">{provider.address}</div>
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(provider.status)}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(provider)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                {provider.status !== 'VERIFIED' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onVerify(provider)}
                    className="text-green-500 hover:text-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(provider)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {providers.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                No hay proveedores registrados
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ServiceProviderTable;
