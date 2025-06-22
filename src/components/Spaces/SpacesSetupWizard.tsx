import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Building, Cog, Home, ParkingCircle, Droplets, Grid, StepForward, CheckCircle2 } from 'lucide-react';

// Definición de tipos para los pasos del wizard
type SpaceTypeConfig = {
  name: string;
  description: string;
  isReservable: boolean;
  isAssignable: boolean;
  enabled: boolean;
  icon: React.ReactNode;
  required?: boolean;
};

type UnitGenerationConfig = {
  totalFloors: number;
  unitsPerFloor: number;
  startingFloor: number;
  floorNames: string[];
  unitPrefix: string;
};

type WizardStep = 'types' | 'units' | 'confirmation';

type SpacesSetupWizardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buildingId: string;
  onComplete: () => void;
};

export default function SpacesSetupWizard({ open, onOpenChange, buildingId, onComplete }: SpacesSetupWizardProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<WizardStep>('types');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Predefined space types with default values
  const [spaceTypes, setSpaceTypes] = useState<SpaceTypeConfig[]>([
    {
      name: 'Unidad',
      description: 'Apartamentos o unidades habitacionales del edificio',
      isReservable: false,
      isAssignable: true,
      enabled: true, // Always enabled
      required: true,
      icon: <Home className="h-8 w-8 text-primary" />
    },
    {
      name: 'SUM',
      description: 'Salón de usos múltiples para eventos',
      isReservable: true,
      isAssignable: false,
      enabled: false,
      icon: <Building className="h-8 w-8 text-primary" />
    },
    {
      name: 'Piscina',
      description: 'Área de natación y recreación',
      isReservable: false,
      isAssignable: false,
      enabled: false,
      icon: <Droplets className="h-8 w-8 text-primary" />
    },
    {
      name: 'Terraza',
      description: 'Espacio al aire libre en la parte superior',
      isReservable: true,
      isAssignable: false,
      enabled: false,
      icon: <Grid className="h-8 w-8 text-primary" />
    },
    {
      name: 'Parrilla',
      description: 'Área para asados y reuniones',
      isReservable: true,
      isAssignable: false,
      enabled: false,
      icon: <Cog className="h-8 w-8 text-primary" />
    },
    {
      name: 'Estacionamiento',
      description: 'Espacios para vehículos',
      isReservable: false,
      isAssignable: true,
      enabled: false,
      icon: <ParkingCircle className="h-8 w-8 text-primary" />
    }
  ]);
  
  // Unit generation configuration
  const [unitConfig, setUnitConfig] = useState<UnitGenerationConfig>({
    totalFloors: 1,
    unitsPerFloor: 4,
    startingFloor: 1,
    floorNames: ['1'],
    unitPrefix: ''
  });
  
  // Update unit config floors when total floors change
  const updateFloorNames = (total: number) => {
    const start = unitConfig.startingFloor;
    const newFloorNames = Array.from({ length: total }, (_, i) => 
      String(start + i)
    );
    setUnitConfig({
      ...unitConfig,
      totalFloors: total,
      floorNames: newFloorNames
    });
  };
  
  // Update a specific floor name
  const updateFloorName = (index: number, name: string) => {
    const newFloorNames = [...unitConfig.floorNames];
    newFloorNames[index] = name;
    setUnitConfig({
      ...unitConfig,
      floorNames: newFloorNames
    });
  };
  
  // Toggle a space type
  const toggleSpaceType = (index: number) => {
    if (spaceTypes[index].required) return; // Can't toggle required types
    
    const updatedTypes = [...spaceTypes];
    updatedTypes[index].enabled = !updatedTypes[index].enabled;
    setSpaceTypes(updatedTypes);
  };
  
  // Update space type properties
  const updateSpaceType = (index: number, property: keyof SpaceTypeConfig, value: boolean) => {
    const updatedTypes = [...spaceTypes];
    updatedTypes[index][property] = value as never;
    setSpaceTypes(updatedTypes);
  };
  
  // Navigate to next step
  const goToNextStep = () => {
    if (currentStep === 'types') {
      setCurrentStep('units');
    } else if (currentStep === 'units') {
      setCurrentStep('confirmation');
    }
  };
  
  // Navigate to previous step
  const goToPreviousStep = () => {
    if (currentStep === 'confirmation') {
      setCurrentStep('units');
    } else if (currentStep === 'units') {
      setCurrentStep('types');
    }
  };
  
  // Submit and create all configured spaces
  const submitConfiguration = async () => {
    try {
      setIsSubmitting(true);
      
      // 1. Setup tables first - usando el nuevo endpoint sin restricciones de roles
      console.log(`[SpacesSetupWizard] Configurando tablas para building ${buildingId}`);
      await api.post(`/buildings/${buildingId}/spaces-setup/setup-tables`);
      
      // 2. Create each enabled space type - usando el nuevo endpoint sin restricciones de roles
      const enabledTypes = spaceTypes.filter(type => type.enabled);
      console.log(`[SpacesSetupWizard] Creando ${enabledTypes.length} tipos de espacios`);
      
      for (const type of enabledTypes) {
        console.log(`[SpacesSetupWizard] Creando tipo de espacio: ${type.name}`);
        await api.post(`/buildings/${buildingId}/spaces-setup/create-space-type`, {
          name: type.name,
          description: type.description,
          isReservable: type.isReservable,
          isAssignable: type.isAssignable
        });
      }
      
      // 3. Generate units if Unidad type is enabled
      const unitType = spaceTypes.find(type => type.name === 'Unidad' && type.enabled);
      if (unitType) {
        // Get the ID of the Unidad type we just created - usando el nuevo endpoint sin restricciones de roles
        console.log(`[SpacesSetupWizard] Obteniendo tipos de espacios creados`);
        const typesResponse = await api.get(`/buildings/${buildingId}/spaces-setup/list-space-types`);
        const typesData = typesResponse.data as any[];
        const unitTypeData = typesData.find(t => t.name === 'Unidad');
        
        if (unitTypeData) {
          console.log(`[SpacesSetupWizard] Tipo de espacio 'Unidad' encontrado con ID: ${unitTypeData.id}`);
          // Generate units based on configuration - usando el nuevo endpoint sin restricciones de roles
          console.log(`[SpacesSetupWizard] Generando ${unitConfig.totalFloors * unitConfig.unitsPerFloor} unidades`);
          await api.post(`/buildings/${buildingId}/spaces-setup/generate-units`, {
            floors: unitConfig.totalFloors,
            unitsPerFloor: unitConfig.unitsPerFloor,
            nomenclature: 'NUMBERS', // Usando nomenclatura numérica por defecto
            hasGroundFloor: false,    // No incluir planta baja
            hasBasement: false,       // No incluir subsuelos
            prefix: unitConfig.unitPrefix,
            typeId: unitTypeData.id,  // Enviamos el ID del tipo 'Unidad' que acabamos de crear
            // No enviamos floorNames porque el backend genera los nombres automáticamente
          });
        } else {
          console.error(`[SpacesSetupWizard] No se encontró el tipo de espacio 'Unidad' después de crearlo`);
        }
      }
      
      toast({
        title: 'Configuración completada',
        description: 'El módulo de espacios ha sido configurado exitosamente',
        variant: 'default'
      });
      
      
      // Close wizard and refresh page
      onOpenChange(false);
      onComplete();
      
    } catch (error) {
      console.error('Error en la configuración de espacios:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error durante la configuración. Por favor intenta nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración del Módulo de Espacios</DialogTitle>
          <DialogDescription>
            Configura rápidamente los espacios y unidades de tu edificio
          </DialogDescription>
        </DialogHeader>
        
        {/* Step Navigation */}
        <div className="flex justify-between mb-6 border-b pb-4">
          <Button
            variant={currentStep === 'types' ? 'default' : 'outline'}
            className={cn("rounded-full", currentStep === 'types' ? 'text-white' : '')}
            onClick={() => setCurrentStep('types')}
            disabled={isSubmitting}
          >
            1. Tipos de Espacios
          </Button>
          <Button
            variant={currentStep === 'units' ? 'default' : 'outline'}
            className={cn("rounded-full", currentStep === 'units' ? 'text-white' : '')}
            onClick={() => setCurrentStep('units')}
            disabled={isSubmitting}
          >
            2. Configurar Unidades
          </Button>
          <Button
            variant={currentStep === 'confirmation' ? 'default' : 'outline'}
            className={cn("rounded-full", currentStep === 'confirmation' ? 'text-white' : '')}
            onClick={() => setCurrentStep('confirmation')}
            disabled={isSubmitting}
          >
            3. Confirmar
          </Button>
        </div>
        
        {/* Step 1: Space Types */}
        {currentStep === 'types' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Selecciona los tipos de espacios</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Activa los tipos de espacios que tiene tu edificio y configura sus propiedades
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {spaceTypes.map((type, index) => (
                <Card key={index} className={cn(
                  "transition-all duration-300",
                  type.enabled ? "border-primary" : "opacity-70"
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {type.icon}
                        <CardTitle className="text-md">{type.name}</CardTitle>
                      </div>
                      <Switch 
                        checked={type.enabled} 
                        onCheckedChange={() => toggleSpaceType(index)}
                        disabled={type.required}
                      />
                    </div>
                    <CardDescription>{type.description}</CardDescription>
                  </CardHeader>
                  {type.enabled && (
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`reservable-${index}`} className="text-sm">Reservable</Label>
                          <Switch 
                            id={`reservable-${index}`}
                            checked={type.isReservable}
                            onCheckedChange={(checked) => updateSpaceType(index, 'isReservable', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`assignable-${index}`} className="text-sm">Asignable a propietarios</Label>
                          <Switch 
                            id={`assignable-${index}`}
                            checked={type.isAssignable}
                            onCheckedChange={(checked) => updateSpaceType(index, 'isAssignable', checked)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Step 2: Units Configuration */}
        {currentStep === 'units' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configuración de Unidades</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Configura cómo se generarán las unidades de tu edificio
            </p>
            
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalFloors">Cantidad de Pisos</Label>
                  <Input 
                    id="totalFloors" 
                    type="number" 
                    min="1"
                    value={unitConfig.totalFloors} 
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      updateFloorNames(value);
                    }} 
                  />
                </div>
                <div>
                  <Label htmlFor="unitsPerFloor">Unidades por Piso</Label>
                  <Input 
                    id="unitsPerFloor" 
                    type="number" 
                    min="1"
                    value={unitConfig.unitsPerFloor} 
                    onChange={(e) => setUnitConfig({
                      ...unitConfig,
                      unitsPerFloor: parseInt(e.target.value) || 1
                    })} 
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="unitPrefix">Prefijo de Unidad (opcional)</Label>
                <Input 
                  id="unitPrefix" 
                  placeholder="Ej: Unidad "
                  value={unitConfig.unitPrefix} 
                  onChange={(e) => setUnitConfig({
                    ...unitConfig,
                    unitPrefix: e.target.value
                  })} 
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Ejemplo: "{unitConfig.unitPrefix}1A", "{unitConfig.unitPrefix}2B"
                </p>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Nombres de los pisos</h4>
                <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                  {unitConfig.floorNames.map((name, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Label htmlFor={`floor-${index}`} className="w-12 text-sm">
                        Piso {index + unitConfig.startingFloor}:
                      </Label>
                      <Input 
                        id={`floor-${index}`} 
                        value={name}
                        className="flex-1"
                        onChange={(e) => updateFloorName(index, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-muted rounded-md">
                <h4 className="text-sm font-medium mb-2">Vista previa</h4>
                <p className="text-sm">
                  Se generarán <strong>{unitConfig.totalFloors * unitConfig.unitsPerFloor}</strong> unidades 
                  en <strong>{unitConfig.totalFloors}</strong> pisos.
                </p>
                <p className="text-sm mt-1">
                  Ejemplo de nomenclatura: 
                  {unitConfig.floorNames[0] && 
                    <span className="font-medium"> {unitConfig.unitPrefix}{unitConfig.floorNames[0]}A, {unitConfig.unitPrefix}{unitConfig.floorNames[0]}B...</span>
                  }
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 3: Confirmation */}
        {currentStep === 'confirmation' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-medium">Confirmar Configuración</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Revisa la configuración antes de finalizar
            </p>
            
            <Card>
              <CardHeader>
                <CardTitle>Tipos de espacios a crear</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {spaceTypes
                    .filter(type => type.enabled)
                    .map((type, index) => (
                      <li key={index} className="flex items-center gap-2">
                        {type.icon}
                        <span className="font-medium">{type.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {type.isReservable && "Reservable"}
                          {type.isReservable && type.isAssignable && ", "}
                          {type.isAssignable && "Asignable"}
                        </span>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
            
            {spaceTypes.find(type => type.name === 'Unidad' && type.enabled) && (
              <Card>
                <CardHeader>
                  <CardTitle>Unidades a generar</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Total: <strong>{unitConfig.totalFloors * unitConfig.unitsPerFloor} unidades</strong></p>
                  <p>Pisos: <strong>{unitConfig.totalFloors}</strong></p>
                  <p>Unidades por piso: <strong>{unitConfig.unitsPerFloor}</strong></p>
                  
                  <div className="mt-2 text-sm">
                    <p className="font-medium">Nomenclatura:</p>
                    <div className="mt-1 text-muted-foreground">
                      {unitConfig.floorNames.slice(0, 2).map((floor, i) => (
                        <div key={i}>
                          Piso {i + unitConfig.startingFloor}: {unitConfig.unitPrefix}{floor}A, {unitConfig.unitPrefix}{floor}B
                          {unitConfig.unitsPerFloor > 2 && '...'}
                        </div>
                      ))}
                      {unitConfig.floorNames.length > 2 && '...'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-700">
              <p className="text-sm font-medium">Importante</p>
              <p className="text-sm">Esta acción creará las tablas y datos iniciales para el módulo de espacios.</p>
            </div>
          </div>
        )}
        
        <DialogFooter className="mt-4 pt-4 border-t">
          {currentStep !== 'types' && (
            <Button 
              variant="outline" 
              onClick={goToPreviousStep}
              disabled={isSubmitting}
            >
              Anterior
            </Button>
          )}
          
          {currentStep !== 'confirmation' ? (
            <Button onClick={goToNextStep} disabled={isSubmitting}>
              Siguiente
            </Button>
          ) : (
            <Button 
              onClick={submitConfiguration} 
              disabled={isSubmitting}
              className="bg-primary"
            >
              {isSubmitting ? 'Configurando...' : 'Completar Configuración'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
