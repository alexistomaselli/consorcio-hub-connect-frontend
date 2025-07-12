import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBuilding } from '../context/BuildingContext';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../components/ui/alert';
import { BookOpen, Upload, FileText, Trash2, AlertCircle, CheckCircle, Download } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { api } from '../lib/api';
import { API_BASE_URL } from '../lib/api';

// Definición de la interfaz para la entidad de archivo
interface FileEntity {
  id: string;
  type: string;
  name: string;
  owner_id: string;
  filename: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  is_processed: boolean;
  created_at: string;
  updated_at: string;
}

const Regulations = () => {
  const { user } = useAuth();
  const { currentBuilding } = useBuilding();
  const [regulation, setRegulation] = useState<FileEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("view");
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const [isConfiguringTable, setIsConfiguringTable] = useState(false);

  const isAdmin = user?.role === 'BUILDING_ADMIN';

  // Declaración de la función fetchRegulation al inicio para evitar errores de hoisting
  const fetchRegulation = async () => {
    if (!user?.buildingId) {
      console.error('No hay buildingId en el objeto user al intentar obtener reglamento:', user);
      return;
    }
    
    try {
      setIsLoading(true);
      setRegulation(null); // Limpiar el estado primero para evitar datos inconsistentes
      setError(null); // Limpiar cualquier error previo
      
      const endpoint = `/buildings/${user.buildingId}/files/regulation`;
      console.log('Endpoint para obtener reglamento:', endpoint);
      const response = await api.get(endpoint);

      console.log('Respuesta de obtener reglamento:', response.data);
      
      // Verificar explícitamente si hay datos válidos en la respuesta
      const responseData = response.data as Partial<FileEntity> | null;
      if (responseData && responseData.id) {
        setRegulation(response.data as FileEntity);
        console.log('Reglamento encontrado y establecido en el estado');
      } else {
        console.log('No se encontró reglamento válido para este edificio');
        setRegulation(null);
      }
      
    } catch (err) {
      console.error('Error al obtener reglamento:', err);
      setError('Error al obtener el reglamento.');
      setRegulation(null); // Asegurarse de que no queden datos antiguos
    } finally {
      setIsLoading(false);
    }
  };

  // Función para verificar si la tabla files existe
  const checkTablesConfiguration = async () => {
    if (!user?.buildingId) {
      console.error('No hay buildingId en el objeto user al verificar tablas:', user);
      return;
    }
    
    try {
      setIsLoading(true);
      console.log(`Verificando tabla files para el edificio ID: ${user.buildingId}`);
      
      const endpoint = `/buildings/${user.buildingId}/files/check-tables`;
      console.log('Endpoint para verificar tablas:', endpoint);
      const response = await api.get(endpoint);
      
      console.log('Respuesta de verificación de tabla:', response.data);
      
      // Si se requiere configuración, mostrar botón para configurar
      // Aplicamos un tipo explícito a la respuesta para manejar setup_required
      interface TableCheckResponse {
        setup_required: boolean;
        message?: string;
        error?: boolean;
      }
      
      // Usamos type assertion para indicarle a TypeScript que conocemos la estructura
      const responseData = response.data as TableCheckResponse;
      if (responseData && responseData.setup_required === true) {
        console.log('Se requiere configuración de tabla files');
        setTableExists(false);
      } else {
        console.log('Tabla files ya existe, cargando datos...');
        setTableExists(true);
        // Cargar reglamentos solo si la tabla existe
        await fetchRegulation();
      }
    } catch (err) {
      console.error('Error al verificar tablas:', err);
      setError('Error al verificar la configuración de tablas.');
      setTableExists(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para configurar la tabla files
  const configureTable = async () => {
    if (!user?.buildingId) {
      console.error('No hay buildingId en el objeto user al configurar tablas:', user);
      return;
    }
    
    try {
      setIsConfiguringTable(true);
      console.log(`Configurando tabla files para el edificio ID: ${user.buildingId}`);
      
      const endpoint = `/buildings/${user.buildingId}/files/setup-tables`;
      console.log('Endpoint para configurar tablas:', endpoint);
      const response = await api.post(endpoint);
      
      console.log('Respuesta de configuración de tabla:', response.data);
      
      setSuccess('Módulo de archivos configurado correctamente.');
      setTableExists(true);
      
      // Actualizar datos después de configurar
      await fetchRegulation();
    } catch (err) {
      console.error('Error al configurar tablas:', err);
      setError('Error al configurar el módulo de archivos.');
    } finally {
      setIsConfiguringTable(false);
    }
  };

  // La función fetchRegulation ya fue declarada al inicio del componente

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      console.log('Archivo seleccionado:', file.name, 'tipo:', file.type, 'tamaño:', file.size);
      setSelectedFile(file);
    }
  };

  // Función para subir un archivo usando XMLHttpRequest para tener mayor control
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Por favor seleccione un archivo para subir.');
      return;
    }

    if (!user?.buildingId) {
      console.error('No hay buildingId en el objeto user al subir archivo:', user);
      setError('No se pudo identificar el edificio para subir el archivo.');
      return;
    }
    
    // Verificar si el usuario tiene permiso de administrador
    console.log('Usuario actual:', user);
    console.log('¿Es admin?', isAdmin);
    if (!isAdmin) {
      setError('Solo los administradores del edificio pueden subir archivos.');
      return;
    }
    
    // Verificaciones básicas
    if (selectedFile.size === 0) {
      setError('El archivo seleccionado está vacío');
      return;
    }
    
    if (!selectedFile.type.includes('pdf')) {
      setError('El archivo debe ser un PDF');
      return;
    }

    try {
      // Limpiar estados previos
      setError(null);
      setSuccess(null);
      setUploading(true);
      
      // Verificar si el token está disponible
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No se encontró token de autenticación. Por favor, inicie sesión nuevamente.');
        setUploading(false);
        return;
      }
      console.log('Token existe:', !!token, 'primeros 20 caracteres:', token.substring(0, 20) + '...');
      
      console.log('Iniciando carga del archivo:', selectedFile.name, 'tamaño:', selectedFile.size, 'bytes');
      console.log('Tipo del archivo:', selectedFile.type);
      
      // Crear un nuevo FormData con la mínima configuración necesaria
      const formData = new FormData();
      
      // IMPORTANTE: Asegurarse de que el nombre del campo sea 'file'
      formData.append('file', selectedFile);
      formData.append('type', 'regulation');
      formData.append('name', 'Reglamento de Copropiedad');
      
      // Para debugging - verificar el contenido de formData
      for (let pair of formData.entries()) {
        console.log('FormData contiene:', pair[0], pair[1]);
        if (pair[0] === 'file' && pair[1] instanceof File) {
          console.log('Archivo encontrado:', pair[1].name, 'tamaño:', pair[1].size);
        }
      }
      
      // Endpoint completo incluyendo la URL base
      const fullEndpoint = `${API_BASE_URL}/buildings/${user.buildingId}/files/upload`;
      console.log('Usando endpoint completo:', fullEndpoint);
      
      // Usar XMLHttpRequest para tener control total sobre la subida
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Monitorear el progreso de la subida
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            console.log(`Progreso de subida: ${percentComplete}%`);
          }
        };
        
        // Configurar manejadores de eventos
        xhr.onload = function() {
          console.log('Respuesta completa del servidor:', {
            status: xhr.status,
            statusText: xhr.statusText,
            response: xhr.responseText.substring(0, 200) + (xhr.responseText.length > 200 ? '...' : '')
          });
          
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const responseData = JSON.parse(xhr.responseText);
              if (responseData.error) {
                setError(responseData.message || 'Error al subir el archivo');
              } else if (responseData.file) {
                setRegulation(responseData.file);
                setSelectedFile(null);
                setSuccess('Reglamento subido correctamente.');
                fetchRegulation();
              } else {
                setError('No se recibió información del archivo subido');
              }
            } catch (parseError) {
              console.error('Error al parsear respuesta:', parseError);
              setError('Error al procesar la respuesta del servidor');
            }
            resolve(true);
          } else if (xhr.status === 401) {
            console.error('Error de autenticación 401. Verificar token y permisos.');
            try {
              const errorData = JSON.parse(xhr.responseText);
              setError(errorData.message || 'Error de autenticación. Verifique que tiene permisos de administrador.');
            } catch (e) {
              setError('Error de autenticación. Verifique que tiene permisos de administrador.');
            }
            reject(new Error('Error de autenticación'));
          } else {
            console.error('Error en la respuesta:', xhr.status, xhr.statusText, xhr.responseText);
            try {
              const errorData = JSON.parse(xhr.responseText);
              setError(errorData.message || `Error ${xhr.status}: ${xhr.statusText}`);
            } catch (e) {
              setError(`Error ${xhr.status}: ${xhr.statusText}`);
            }
            reject(new Error(`Error ${xhr.status}: ${xhr.statusText}`));
          }
        };
        
        xhr.onerror = function() {
          console.error('Error de red al subir el archivo');
          setError('Error de red al intentar subir el archivo. Verifique su conexión.');
          reject(new Error('Error de red'));
        };
        
        xhr.open('POST', fullEndpoint, true);
        
        // Establecer encabezados de autenticación
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        console.log('Token de autorización configurado para XMLHttpRequest');
        
        // Configurar tiempo de espera
        xhr.timeout = 60000; // 60 segundos
        xhr.ontimeout = function() {
          setError('La conexión ha expirado. Intente nuevamente.');
          reject(new Error('Timeout'));
        };
        
        // NO establecer Content-Type para que el navegador configure el boundary correcto
        // xhr.setRequestHeader('Content-Type', 'multipart/form-data');
        
        console.log('Enviando solicitud XMLHttpRequest...');
        xhr.send(formData);
      })
      .finally(() => {
        setUploading(false);
      });
    } catch (err: any) {
      console.error('Error al preparar la subida del archivo:', err);
      setError(err.message || 'Error al preparar la subida del archivo');
      setUploading(false);
    }
  };

  // Función para eliminar un archivo
  const handleDelete = async () => {
    if (!regulation || !user?.buildingId) {
      console.error('No hay reglamento para eliminar o no se identificó el edificio');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Modificado para usar 'regulation' como tipo en lugar del ID
      const endpoint = `/buildings/${user.buildingId}/files/regulation`;
      console.log('Endpoint para eliminar archivo:', endpoint);
      console.log('ID del archivo a eliminar:', regulation.id, 'Tipo:', 'regulation');
      
      // Llamar al endpoint de eliminación con el tipo correcto
      const response = await api.delete(endpoint);
      console.log('Respuesta de eliminación:', response.data);
      
      // Después actualizamos el estado
      setRegulation(null);
      setDeleteDialogOpen(false);
      setSuccess('Reglamento eliminado correctamente.');
      
      // Actualizar datos
      await fetchRegulation();
    } catch (err: any) {
      console.error('Error al eliminar archivo:', err);
      setError(err.response?.data?.message || 'Error al eliminar el reglamento.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para abrir el diálogo de confirmación
  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  // Efecto para iniciar la verificación y cargar el reglamento cuando se carga el componente
  useEffect(() => {
    if (user?.buildingId) {
      const initialize = async () => {
        await checkTablesConfiguration();
        await fetchRegulation();
      };
      
      initialize();
    }
  }, [user?.buildingId]);
  
  // Efecto para actualizar la pestaña activa cuando cambia el regulation
  useEffect(() => {
    if (regulation) {
      setActiveTab("view");
    } else {
      setActiveTab("upload");
    }
  }, [regulation]);

  return (
    <div className="container mx-auto py-8">
      {/* Mostrar botón de configuración solo si se requiere y el usuario es admin */}
      {tableExists === false && isAdmin && (
        <div className="mb-8">
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuración requerida</AlertTitle>
            <AlertDescription>El módulo de archivos requiere configuración inicial.</AlertDescription>
          </Alert>
          <Button 
            onClick={configureTable}
            className="bg-consorcio-blue hover:bg-blue-700"
            disabled={isConfiguringTable}
          >
            {isConfiguringTable ? 'Configurando...' : 'Configurar Módulo'}
          </Button>
        </div>
      )}
      
      {/* Mostrar contenido normal solo si la tabla existe */}
      {tableExists === true && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 mb-8">
            <BookOpen className="h-8 w-8 text-consorcio-blue" />
            <h1 className="text-3xl font-bold">Reglamento de Copropiedad</h1>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Éxito</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {isAdmin ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-3xl">
              <TabsList>
                <TabsTrigger value="view">Ver Reglamento</TabsTrigger>
                {!regulation ? (
                  <TabsTrigger value="upload">Subir Reglamento</TabsTrigger>
                ) : (
                  <TabsTrigger value="upload" disabled className="opacity-50" title="Ya existe un reglamento cargado">Subir Reglamento</TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="view">
                <Card>
                  <CardHeader>
                    <CardTitle>Ver Reglamento</CardTitle>
                    <CardDescription>
                      Reglamento de copropiedad del edificio
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8">Cargando...</div>
                    ) : regulation ? (
                      <div className="space-y-6">
                        <div className="grid gap-4">
                          {/* Información del documento */}
                          <div>
                            <h3 className="text-lg font-semibold">Información del documento</h3>
                            <ul className="mt-2 space-y-2">
                              <li className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span className="font-medium">Nombre:</span> {regulation.filename}
                              </li>
                              <li>
                                <span className="font-medium">Tamaño:</span> {formatFileSize(regulation.file_size)}
                              </li>
                              <li>
                                <span className="font-medium">Fecha de actualización:</span> {formatDate(regulation.updated_at)}
                              </li>
                            </ul>
                          </div>
                          
                          {/* Botones de acción */}
                          <div className="flex gap-4 w-full mb-4">
                            <div className="w-1/2">
                              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    className="w-full"
                                    onClick={openDeleteDialog}
                                    disabled={isLoading}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" /> Eliminar reglamento
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción eliminará permanentemente el reglamento y no se puede deshacer.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                            <div className="w-1/2">
                              <Button variant="outline" asChild className="w-full">
                                <a href={`${API_BASE_URL}/simple-files/regulation/${user.buildingId}`} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4 mr-2" /> Ver en nueva pestaña
                                </a>
                              </Button>
                            </div>
                          </div>
                          
                          {/* Visualización del PDF */}
                          <iframe 
                            src={`${API_BASE_URL}/simple-files/regulation/${user.buildingId}#pagemode=none`}
                            className="w-full h-[500px] border rounded-lg"
                            title="Reglamento de Copropiedad"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="mx-auto h-12 w-12 mb-2" />
                        <p>No hay reglamento disponible para este edificio</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="upload" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Subir Reglamento</CardTitle>
                    <CardDescription>
                      Suba el reglamento de copropiedad del edificio en formato PDF
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="regulation">Archivo PDF</Label>
                      <Input 
                        id="regulation"
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                        className="cursor-pointer"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Solo archivos PDF. El tamaño máximo es de 10MB.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="button"
                      disabled={!selectedFile || uploading}
                      onClick={handleUpload}
                      className="ml-auto"
                    >
                      {uploading ? (
                        'Subiendo...'
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          {regulation ? 'Actualizar reglamento' : 'Subir reglamento'}
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            // Vista para usuarios no administradores
            <Card>
              <CardHeader>
                <CardTitle>Reglamento de Copropiedad</CardTitle>
                <CardDescription>
                  Documento oficial del reglamento del edificio
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Cargando...</div>
                ) : regulation ? (
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      <div className="mb-4">
                        <Button variant="outline" asChild className="w-full">
                          <a href={`${API_BASE_URL}/simple-files/regulation/${user.buildingId}`} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" /> Ver en nueva pestaña
                          </a>
                        </Button>
                      </div>
                      {/* Solo renderiza el iframe si hay un reglamento disponible */}
                      {regulation && (
                        <iframe 
                          src={`${API_BASE_URL}/simple-files/regulation/${user.buildingId}#pagemode=none`}
                          className="w-full h-[500px] border rounded-lg"
                          title="Reglamento de Copropiedad"
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="mx-auto h-12 w-12 mb-2" />
                    <p>No hay reglamento disponible para este edificio</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

// Función auxiliar para formatear el tamaño del archivo
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Función auxiliar para formatear fechas
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default Regulations;
