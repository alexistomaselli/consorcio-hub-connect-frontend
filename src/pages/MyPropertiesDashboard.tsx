import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Building } from '@/types/building';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Home, Building as BuildingIcon, Wrench, MessageSquare, ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface OwnerBuilding extends Building {
    unitNumber?: string;
    source?: 'relation' | 'unit';
    role?: 'OWNER' | 'RESIDENT'; // We will use this in the future
    logo?: string;
}

export default function MyPropertiesDashboard() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [properties, setProperties] = useState<OwnerBuilding[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProperties();
    }, [currentUser]);

    const fetchProperties = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            // Fetch units where the current user is the owner
            const { data: units, error } = await supabase
                .from('units')
                .select(`
                    id,
                    number,
                    floor,
                    building:buildings (
                        id,
                        name,
                        address,
                        city,
                        state,
                        zip_code,
                        status
                    )
                `)
                .eq('ownerId', currentUser.id);

            if (error) throw error;

            // Map response to OwnerBuilding format
            const mappedProperties: OwnerBuilding[] = (units || []).map((unit: any) => ({
                id: unit.building.id,
                name: unit.building.name,
                address: unit.building.address,
                city: unit.building.city,
                state: unit.building.state,
                zipCode: unit.building.zip_code, // Mapeo snake_case
                status: unit.building.status,
                // Additional fields for OwnerBuilding
                unitNumber: unit.floor ? `${unit.floor}-${unit.number}` : unit.number,
                source: 'unit',
                role: 'OWNER',
                // logo: unit.building.logo // If logo exists in schema
            }));

            setProperties(mappedProperties);
        } catch (error) {
            console.error('Error fetching properties:', error);
            toast.error('No se pudieron cargar tus propiedades');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Mis Propiedades</h1>
                <p className="text-muted-foreground">
                    Gestiona todas tus unidades y espacios desde un solo lugar.
                </p>
            </div>

            {properties.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                        <BuildingIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No tienes propiedades asociadas</h3>
                        <p className="text-muted-foreground max-w-sm mt-2">
                            Si crees que esto es un error, contacta a la administración de tu edificio.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                        <Card key={`${property.id}-${property.unitNumber}`} className="group hover:shadow-lg transition-all duration-300 border-none shadow-md overflow-hidden relative">
                            {/* Top Banner with Image/Gradient */}
                            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <Badge variant="secondary" className="bg-white/90 text-primary font-semibold shadow-sm">
                                        {property.role === 'OWNER' ? 'Propietario' : 'Residente'}
                                    </Badge>
                                </div>
                            </div>

                            <CardContent className="pt-0 -mt-12 relative px-6">
                                {/* Building Icon/Logo */}
                                <div className="h-20 w-20 rounded-xl bg-white shadow-lg flex items-center justify-center p-2 mb-4 border border-gray-100">
                                    {property.logo ? (
                                        <img src={property.logo} alt={property.name} className="h-full w-full object-contain" />
                                    ) : (
                                        <BuildingIcon className="h-10 w-10 text-primary" />
                                    )}
                                </div>

                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                                        {property.name}
                                    </h3>
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                        <Home className="h-4 w-4 mr-1.5" />
                                        <span className="font-medium">Unidad {property.unitNumber}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 truncate">
                                        {property.address}
                                    </p>
                                </div>

                                {/* Quick Actions */}
                                <div className="grid grid-cols-2 gap-3 mt-6">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-xs h-auto py-2.5 px-3 border-gray-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100"
                                        onClick={() => navigate('/my-claims')}
                                    >
                                        <Wrench className="h-3.5 w-3.5 mr-2" />
                                        Reclamos
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-xs h-auto py-2.5 px-3 border-gray-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100"
                                    // onClick={() => navigate('/messages')} // Future
                                    >
                                        <MessageSquare className="h-3.5 w-3.5 mr-2" />
                                        Mensajes
                                    </Button>
                                    {/* Owner Specific Actions */}
                                    {property.role === 'OWNER' && (
                                        <Button
                                            variant="outline"
                                            className="w-full col-span-2 justify-center text-xs h-auto py-2.5 bg-gray-50 border-gray-100 hover:bg-gray-100 text-gray-700"
                                        // onClick={() => navigate('/expenses')} // Future
                                        >
                                            Ver Expensas y Balances
                                        </Button>
                                    )}
                                </div>
                            </CardContent>

                            <CardFooter className="px-6 pb-6 pt-2 border-t border-gray-50 bg-gray-50/50 mt-2">
                                <Button className="w-full group-hover:bg-primary group-hover:text-white transition-colors" onClick={() => {
                                    // Here we could navigate to a detailed 'Unit Dashboard' or just context switch
                                    toast.info(`Gestionando Unidad ${property.unitNumber}`);
                                }}>
                                    Gestionar Unidad
                                    <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}

                    {/* Add New Property Card (Invitation) */}
                    <Card className="border-2 border-dashed border-gray-200 hover:border-primary/50 hover:bg-blue-50/10 transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center shadow-none group"
                        onClick={() => {
                            // Logic to accept invitation code
                            toast.info("Próximamente: Ingresar código de invitación");
                        }}
                    >
                        <div className="h-16 w-16 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center mb-4 transition-colors">
                            <Plus className="h-8 w-8 text-gray-400 group-hover:text-primary transition-colors" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Agregar Propiedad</h3>
                        <p className="text-sm text-muted-foreground mt-1">¿Tienes un código de invitación?</p>
                    </Card>
                </div>
            )}
        </div>
    );
}
