import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OwnerBuildingInfo {
  id: string;
  name: string;
  address: string;
  unitNumber: string;
  buildingLogo?: string;
}

const OwnerUnit = () => {
  const { currentUser, getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [buildingInfo, setBuildingInfo] = useState<OwnerBuildingInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el usuario está autenticado y es propietario
    if (!currentUser || currentUser.role !== 'OWNER') {
      navigate('/login');
      return;
    }

    const fetchOwnerBuildings = async () => {
      try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/owners/buildings`;
        const response = await fetch(apiUrl, {
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error('Error al obtener la información del edificio');
        }

        const data = await response.json();
        
        if (data && data.length > 0) {
          setBuildingInfo({
            id: data[0].buildingId,
            name: data[0].buildingName,
            address: data[0].address,
            unitNumber: data[0].unitNumber,
            buildingLogo: data[0].logo
          });
        }
      } catch (error) {
        console.error('Error al cargar la información del edificio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerBuildings();
  }, [currentUser, navigate, getAuthHeaders]);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-consorcio-blue" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="grid gap-6">
        <h1 className="text-3xl font-bold">Mi Unidad</h1>
        
        {buildingInfo ? (
          <>
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-consorcio-blue to-blue-400 h-32 flex items-center justify-center">
                {buildingInfo.buildingLogo ? (
                  <img 
                    src={buildingInfo.buildingLogo} 
                    alt={buildingInfo.name}
                    className="h-24 w-24 object-contain bg-white rounded-full p-2"
                  />
                ) : (
                  <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-consorcio-blue">
                      {buildingInfo.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{buildingInfo.name}</CardTitle>
                    <CardDescription>{buildingInfo.address}</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-consorcio-blue/10 border-consorcio-blue text-consorcio-blue">
                    Unidad {buildingInfo.unitNumber}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Servicios disponibles</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => navigate('/payments')}>
                        <span className="text-3xl">💰</span>
                        <span>Pagos</span>
                      </Button>
                      
                      <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => navigate('/messages')}>
                        <span className="text-3xl">💬</span>
                        <span>Mensajes</span>
                      </Button>
                      
                      <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => navigate('/maintenance')}>
                        <span className="text-3xl">🔧</span>
                        <span>Mantenimiento</span>
                      </Button>
                      
                      <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => navigate('/documents')}>
                        <span className="text-3xl">📄</span>
                        <span>Documentos</span>
                      </Button>
                      
                      <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => navigate('/announcements')}>
                        <span className="text-3xl">📢</span>
                        <span>Anuncios</span>
                      </Button>
                      
                      <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => navigate('/profile')}>
                        <span className="text-3xl">👤</span>
                        <span>Mi perfil</span>
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Información de contacto</h3>
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Administración:</span>
                        <a href="tel:+123456789" className="text-consorcio-blue hover:underline">
                          +54 11 1234-5678
                        </a>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Email:</span>
                        <a href="mailto:admin@example.com" className="text-consorcio-blue hover:underline">
                          admin@ejemplo.com
                        </a>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Horario de atención:</span>
                        <span>Lunes a Viernes de 9:00 a 18:00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No se encontró información de unidad</CardTitle>
              <CardDescription>
                No encontramos información de la unidad asociada a tu cuenta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/profile')}>
                Ir a mi perfil
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OwnerUnit;
