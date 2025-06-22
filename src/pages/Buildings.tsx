import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Building } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { BuildingTable } from '@/components/Buildings/BuildingTable';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';

export default function Buildings() {
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loadingBuildings, setLoadingBuildings] = useState(true);
  const [buildingToDelete, setBuildingToDelete] = useState<Building | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBuildings = async () => {
    try {
      setLoadingBuildings(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/buildings`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Error al cargar los edificios');

      const data = await response.json();
      setBuildings(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los edificios",
        variant: "destructive",
      });
    } finally {
      setLoadingBuildings(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  // Filtrar edificios según el término de búsqueda
  const filteredBuildings = buildings.filter(building =>
    building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    building.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Gestión de Edificios</h1>

      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar edificios..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Edificio
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="text-lg font-semibold mb-2">Edificios</div>
          <div className="text-sm text-muted-foreground mb-4">
            Gestiona los edificios registrados en la plataforma
          </div>

          {loadingBuildings ? (
            <div>Cargando...</div>
          ) : (
            <BuildingTable
              buildings={filteredBuildings}
              onEdit={(building) => {
                console.log('Editar edificio:', building);
              }}
              onDelete={(building) => {
                setBuildingToDelete(building);
              }}
            />
          )}
        </div>
      </div>

      <AlertDialog open={!!buildingToDelete} onOpenChange={(open) => !open && setBuildingToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el edificio "{buildingToDelete?.name}" y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!buildingToDelete) return;
                
                try {
                  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/buildings/${buildingToDelete.id}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders(),
                  });

                  if (!response.ok) throw new Error('Error al eliminar el edificio');
                  
                  toast({
                    title: "Éxito",
                    description: "Edificio eliminado correctamente",
                  });
                  
                  // Actualizar la lista de edificios
                  fetchBuildings();
                } catch (error) {
                  console.error('Error:', error);
                  toast({
                    title: "Error",
                    description: "No se pudo eliminar el edificio",
                    variant: "destructive",
                  });
                } finally {
                  setBuildingToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
