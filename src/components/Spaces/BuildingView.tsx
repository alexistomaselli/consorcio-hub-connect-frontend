import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Edit,
  Home,
  Plus,
  Search,
  Trash2,
  User,
  UserPlus,
  UserMinus,
  UserX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Definición de tipos
interface Space {
  id: string;
  name: string;
  type: {
    id: string;
    name: string;
    description?: string;
    isReservable: boolean;
    isAssignable: boolean;
  };
  floor?: string;
  description?: string;
  owners?: {
    id: string;
    firstName: string;
    lastName: string;
    isMain: boolean;
  }[];
}

interface BuildingViewProps {
  spaces: Space[];
  onEditSpace: (space: Space) => void;
  onDeleteSpace: (space: Space) => void;
  onAssignOwner: (spaceId: string) => void;
  onRemoveOwner: (spaceId: string, ownerId: string, isMain: boolean) => void;
}

export default function BuildingView({
  spaces,
  onEditSpace,
  onDeleteSpace,
  onAssignOwner,
  onRemoveOwner
}: BuildingViewProps) {
  const [currentView, setCurrentView] = useState<'building'|'others'>('building');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');

  // Agrupar espacios por tipo
  const spacesByType = useMemo(() => {
    // Separar unidades de otros tipos de espacios
    const units = spaces.filter(space => 
      space.type.name === 'Unidad' || 
      space.name.match(/^[0-9]+$/) || // números solos
      space.name.match(/^[A-Z]?[0-9]+$/)); // letra opcional seguida de números (ej: A101, 101)
    
    const otherSpaces = spaces.filter(space => 
      !units.find(unit => unit.id === space.id));
    
    return {
      units,
      otherSpaces
    };
  }, [spaces]);

  // Obtener los pisos únicos
  const floors = useMemo(() => {
    const floorSet = new Set<string>();
    
    spacesByType.units.forEach(unit => {
      if (unit.floor) {
        floorSet.add(unit.floor);
      } else {
        // Intentar extraer el piso del nombre (ej: "101" → piso "1")
        const floorMatch = unit.name.match(/^[A-Z]?(\d)/);
        if (floorMatch && floorMatch[1]) {
          floorSet.add(floorMatch[1]);
        }
      }
    });
    
    return Array.from(floorSet).sort((a, b) => {
      // Ordenar los pisos de forma descendente (el piso más alto primero)
      // Convertir a números para ordenar correctamente
      return parseInt(b) - parseInt(a);
    });
  }, [spacesByType.units]);

  // Filtrar unidades por piso seleccionado
  const filteredUnits = useMemo(() => {
    if (selectedFloor === 'all') {
      return spacesByType.units;
    }
    
    return spacesByType.units.filter(unit => {
      if (unit.floor === selectedFloor) return true;
      
      // Si no tiene piso explícito, intentar extraerlo del nombre
      const floorMatch = unit.name.match(/^[A-Z]?(\d)/);
      return floorMatch && floorMatch[1] === selectedFloor;
    });
  }, [spacesByType.units, selectedFloor]);

  return (
    <div className="space-y-6">
      <Tabs
        value={currentView}
        onValueChange={(value) => setCurrentView(value as 'building'|'others')}
        className="w-full"
      >
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="building">Vista de Edificio</TabsTrigger>
            <TabsTrigger value="others">Otros Espacios</TabsTrigger>
          </TabsList>
          
          {currentView === 'building' && (
            <Select
              value={selectedFloor}
              onValueChange={setSelectedFloor}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Seleccionar piso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los pisos</SelectItem>
                {floors.map(floor => (
                  <SelectItem key={floor} value={floor}>
                    Piso {floor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <TabsContent value="building" className="min-h-[400px]">
          {floors.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No hay unidades disponibles para visualizar
            </div>
          ) : (
            <div className="space-y-8">
              {selectedFloor === 'all' ? (
                // Mostrar todos los pisos
                floors.map(floor => (
                  <FloorView
                    key={floor}
                    floor={floor}
                    units={spacesByType.units.filter(unit => {
                      if (unit.floor === floor) return true;
                      const floorMatch = unit.name.match(/^[A-Z]?(\d)/);
                      return floorMatch && floorMatch[1] === floor;
                    })}
                    onEditSpace={onEditSpace}
                    onDeleteSpace={onDeleteSpace}
                    onAssignOwner={onAssignOwner}
                    onRemoveOwner={onRemoveOwner}
                  />
                ))
              ) : (
                // Mostrar solo el piso seleccionado
                <FloorView
                  floor={selectedFloor}
                  units={filteredUnits}
                  onEditSpace={onEditSpace}
                  onDeleteSpace={onDeleteSpace}
                  onAssignOwner={onAssignOwner}
                  onRemoveOwner={onRemoveOwner}
                />
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="others" className="min-h-[400px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {spacesByType.otherSpaces.length === 0 ? (
              <div className="col-span-full text-center p-8 text-muted-foreground">
                No hay otros espacios disponibles
              </div>
            ) : (
              spacesByType.otherSpaces.map(space => (
                <OtherSpaceCard 
                  key={space.id} 
                  space={space}
                  onEditSpace={onEditSpace}
                  onDeleteSpace={onDeleteSpace}
                  onAssignOwner={onAssignOwner}
                  onRemoveOwner={onRemoveOwner}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Vista de un piso específico
function FloorView({ 
  floor, 
  units, 
  onEditSpace, 
  onDeleteSpace, 
  onAssignOwner,
  onRemoveOwner
}: { 
  floor: string;
  units: Space[];
  onEditSpace: (space: Space) => void;
  onDeleteSpace: (space: Space) => void;
  onAssignOwner: (spaceId: string) => void;
  onRemoveOwner: (spaceId: string, ownerId: string, isMain: boolean) => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200">
      <div className="px-4 py-2 bg-gray-50 border-b rounded-t-lg">
        <h3 className="font-medium">Piso {floor}</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
        {units.map(unit => (
          <UnitCard 
            key={unit.id} 
            unit={unit}
            onEditSpace={onEditSpace}
            onDeleteSpace={onDeleteSpace}
            onAssignOwner={onAssignOwner}
            onRemoveOwner={onRemoveOwner}
          />
        ))}
      </div>
    </div>
  );
}

// Componente para una unidad individual
function UnitCard({ 
  unit, 
  onEditSpace, 
  onDeleteSpace, 
  onAssignOwner,
  onRemoveOwner
}: { 
  unit: Space;
  onEditSpace: (space: Space) => void;
  onDeleteSpace: (space: Space) => void;
  onAssignOwner: (spaceId: string) => void;
  onRemoveOwner: (spaceId: string, ownerId: string, isMain: boolean) => void;
}) {
  const hasOwners = unit.owners && unit.owners.length > 0;
  
  return (
    <Card className={cn(
      "p-3 relative overflow-hidden transition-all",
      hasOwners ? "bg-blue-50 border-blue-200" : "bg-gray-50 hover:bg-gray-100"
    )}>
      <div className="text-center mb-2">
        <h3 className="font-bold text-lg">{unit.name}</h3>
        {unit.description && (
          <p className="text-xs text-gray-600 truncate" title={unit.description}>
            {unit.description}
          </p>
        )}
      </div>
      
      {/* Lista de propietarios con opciones */}
      {hasOwners ? (
        <div className="text-xs text-gray-700 mb-2 border-t border-gray-200 pt-2">
          {unit.owners!.map((owner) => (
            <div key={owner.id} className="flex items-center justify-between py-1">
              <span className={owner.isMain ? "font-semibold flex items-center" : "flex items-center"}>
                {owner.firstName} {owner.lastName}
                {owner.isMain && (
                  <Badge variant="outline" className="ml-1 text-[10px] py-0 px-1 border-blue-400 text-blue-600">
                    Principal
                  </Badge>
                )}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-1"
                title="Desasociar propietario"
                onClick={() => onRemoveOwner(unit.id, owner.id, !!owner.isMain)}
              >
                <UserMinus className="h-2.5 w-2.5 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-center text-gray-500 italic flex items-center justify-center mb-2">
          <UserX className="h-3 w-3 mr-1" />
          Sin propietario
        </div>
      )}
      
      <div className="flex justify-center space-x-1 mt-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7" 
          title="Asignar propietario"
          onClick={() => onAssignOwner(unit.id)}
        >
          <UserPlus className="h-3 w-3" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7" 
          title="Editar"
          onClick={() => onEditSpace(unit)}
        >
          <Edit className="h-3 w-3" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7" 
          title="Eliminar"
          onClick={() => onDeleteSpace(unit)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
}

// Componente para otros tipos de espacios (no unidades)
function OtherSpaceCard({
  space,
  onEditSpace,
  onDeleteSpace,
  onAssignOwner,
  onRemoveOwner
}: {
  space: Space;
  onEditSpace: (space: Space) => void;
  onDeleteSpace: (space: Space) => void;
  onAssignOwner: (spaceId: string) => void;
  onRemoveOwner: (spaceId: string, ownerId: string, isMain: boolean) => void;
}) {
  const hasOwners = space.owners && space.owners.length > 0;
  
  // Determinar los colores según el tipo de espacio
  const getTypeColor = () => {
    const type = space.type.name.toLowerCase();
    
    if (type.includes('común') || type.includes('comun')) return 'bg-green-50 border-green-200';
    if (type.includes('estacionamiento') || type.includes('parking')) return 'bg-yellow-50 border-yellow-200';
    if (type.includes('servicio') || type.includes('mantenimiento')) return 'bg-purple-50 border-purple-200';
    if (type.includes('recreativo') || type.includes('esparcimiento')) return 'bg-pink-50 border-pink-200';
    
    return 'bg-gray-50 border-gray-200';
  };
  
  return (
    <Card className={cn(
      "p-4 relative overflow-hidden transition-all",
      hasOwners ? "bg-blue-50 border-blue-200" : getTypeColor()
    )}>
      <div className="mb-3">
        <div className="flex justify-between">
          <h3 className="font-bold text-lg">{space.name}</h3>
          <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
            {space.type.name}
          </span>
        </div>
        {space.description && (
          <p className="text-sm text-gray-600 mt-1">
            {space.description}
          </p>
        )}
      </div>
      
      {hasOwners && (
        <div className="text-xs text-gray-700 mb-3 p-2 bg-white bg-opacity-70 rounded">
          <div className="font-semibold mb-1">Asignado a:</div>
          {space.owners!.map((owner) => (
            <div key={owner.id} className="flex items-center justify-between py-1">
              <span className={owner.isMain ? "font-medium flex items-center" : "flex items-center"}>
                {owner.firstName} {owner.lastName}
                {owner.isMain && (
                  <Badge variant="outline" className="ml-1 text-[10px] py-0 px-1 border-blue-400 text-blue-600">
                    Principal
                  </Badge>
                )}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-1"
                title="Desasociar propietario"
                onClick={() => onRemoveOwner(space.id, owner.id, !!owner.isMain)}
              >
                <UserMinus className="h-2.5 w-2.5 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex justify-end space-x-1 mt-3">
        {space.type.isAssignable && (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8"
            onClick={() => onAssignOwner(space.id)}
          >
            <UserPlus className="h-3.5 w-3.5 mr-1" /> Asignar
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onEditSpace(space)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onDeleteSpace(space)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      {space.floor && (
        <div className="absolute top-1 right-1 text-xs text-gray-500">
          Piso: {space.floor}
        </div>
      )}
    </Card>
  );
}
