import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { toast } from "../components/ui/use-toast";
import { StepBasicInfo } from '../components/ProfileWizard/StepBasicInfo';
import { StepCharacteristics } from '../components/ProfileWizard/StepCharacteristics';
import { StepContact } from '../components/ProfileWizard/StepContact';
import { StepAdmin } from '../components/ProfileWizard/StepAdmin';
import { WizardLayout } from '../components/Layout/WizardLayout';

interface FormData {
  basicInfo: {
    buildingName: string;
    address: string;
  };
  characteristics: {
    floors: string;
    totalUnits: string;
    constructionYear?: string;
  };
  contact: {
    phoneNumber: string;
    whatsapp: string;
    email: string;
    website?: string;
    description?: string;
  };
  admin: {
    adminFirstName: string;
    adminLastName: string;
    adminPhone: string;
  };
}

import UserProfile from "./UserProfile";

function BuildingProfileWizard() {
  const { currentUser, updateUser } = useAuth();
  const navigate = useNavigate();
  // ... (rest of existing logic)

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [formData, setFormData] = useState<FormData>({
    basicInfo: {
      buildingName: currentUser?.managedBuildings?.[0]?.name || currentUser?.user_metadata?.building?.name || '',
      address: currentUser?.managedBuildings?.[0]?.address || currentUser?.user_metadata?.building?.address || ''
    },
    characteristics: {
      floors: currentUser?.managedBuildings?.[0]?.floors?.toString() || '',
      totalUnits: currentUser?.managedBuildings?.[0]?.totalUnits?.toString() || '',
      constructionYear: currentUser?.managedBuildings?.[0]?.constructionYear?.toString() || ''
    },
    contact: {
      phoneNumber: currentUser?.managedBuildings?.[0]?.phoneNumber || '',
      whatsapp: currentUser?.managedBuildings?.[0]?.whatsapp || '',
      email: currentUser?.email || '',
      website: currentUser?.managedBuildings?.[0]?.website || '',
      description: currentUser?.managedBuildings?.[0]?.description || ''
    },
    admin: {
      adminFirstName: currentUser?.firstName || '',
      adminLastName: currentUser?.lastName || '',
      adminPhone: currentUser?.phoneNumber || ''
    }
  });

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      const buildingId = currentUser?.buildingId;

      if (!buildingId) {
        throw new Error('No se encontró el ID del edificio');
      }

      // 1. Actualizar datos del edificio
      const { error: buildingError } = await supabase
        .from('buildings')
        .update({
          name: formData.basicInfo.buildingName,
          address: formData.basicInfo.address,
          floors: parseInt(formData.characteristics.floors || '0'),
          totalUnits: parseInt(formData.characteristics.totalUnits || '0'),
          constructionYear: formData.characteristics.constructionYear ? parseInt(formData.characteristics.constructionYear) : null,
          isProfileComplete: true,
          updatedAt: new Date().toISOString()
        })
        .eq('id', buildingId);

      if (buildingError) throw buildingError;

      // 2. Actualizar datos públicos del usuario (public.users)
      const { error: userError } = await supabase
        .from('users')
        .update({
          firstName: formData.admin.adminFirstName,
          lastName: formData.admin.adminLastName,
          isProfileComplete: true,
          updatedAt: new Date().toISOString()
        })
        .eq('id', currentUser?.id);

      if (userError) throw userError;

      // 3. Actualizar metadata de autenticación (auth.users)
      const { data: { user }, error: authError } = await supabase.auth.updateUser({
        data: {
          firstName: formData.admin.adminFirstName,
          lastName: formData.admin.adminLastName,
          isProfileComplete: true,
          building: {
            name: formData.basicInfo.buildingName,
            address: formData.basicInfo.address
          }
        }
      });

      if (authError) throw authError;

      // 4. Actualizar estado local
      if (user) {
        await updateUser({
          firstName: formData.admin.adminFirstName,
          lastName: formData.admin.adminLastName,
          isProfileComplete: true,
          buildingName: formData.basicInfo.buildingName,
          managedBuildings: currentUser?.managedBuildings?.map(b =>
            b.id === buildingId
              ? {
                ...b,
                name: formData.basicInfo.buildingName,
                address: formData.basicInfo.address,
                floors: parseInt(formData.characteristics.floors),
                totalUnits: parseInt(formData.characteristics.totalUnits),
                constructionYear: formData.characteristics.constructionYear ? parseInt(formData.characteristics.constructionYear) : undefined
              }
              : b
          )
        });
      }

      toast({
        title: "¡Perfil completado!",
        description: "Ya puedes comenzar a gestionar los reclamos de tu consorcio."
      });

      navigate('/settings/building');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Hubo un error al actualizar la información. Por favor, intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    let isValid = true;
    let data: any = {};

    // Obtener los datos actuales del formulario
    switch (currentStep) {
      case 1:
        data = formData.basicInfo;
        break;
      case 2:
        data = formData.characteristics;
        break;
      case 3:
        data = formData.contact;
        break;
      case 4:
        data = formData.admin;
        break;
    }

    // Validar los datos según el paso actual
    switch (currentStep) {
      case 1:
        if (!formData.basicInfo.buildingName || !formData.basicInfo.address) {
          toast({
            title: "Error",
            description: "Por favor complete todos los campos requeridos.",
            variant: "destructive"
          });
          isValid = false;
        }
        break;
      case 2:
        if (!data.floors || !data.totalUnits) {
          toast({
            title: "Error",
            description: "Por favor complete todos los campos requeridos.",
            variant: "destructive"
          });
          isValid = false;
        }
        break;
      case 3:
        if (!data.email) {
          toast({
            title: "Error",
            description: "Por favor complete el email, es requerido.",
            variant: "destructive"
          });
          isValid = false;
        }
        break;
      case 4:
        if (!data.adminFirstName || !data.adminLastName || !data.adminPhone) {
          toast({
            title: "Error",
            description: "Por favor complete todos los campos requeridos.",
            variant: "destructive"
          });
          isValid = false;
        }
        break;
    }

    if (!isValid) return;

    // Si pasa la validación, actualizar el estado
    switch (currentStep) {
      case 1:
        setFormData(prev => ({
          ...prev,
          basicInfo: {
            buildingName: data.buildingName as string,
            address: data.address as string
          }
        }));
        break;
      case 2:
        setFormData(prev => ({
          ...prev,
          characteristics: {
            floors: data.floors as string,
            totalUnits: data.totalUnits as string,
            constructionYear: data.constructionYear as string
          }
        }));
        break;
      case 3:
        setFormData(prev => ({
          ...prev,
          contact: {
            phoneNumber: data.phoneNumber as string,
            whatsapp: data.whatsapp as string,
            email: data.email as string,
            website: data.website as string,
            description: data.description as string
          }
        }));
        break;
      case 4:
        setFormData(prev => ({
          ...prev,
          admin: {
            adminFirstName: data.adminFirstName as string,
            adminLastName: data.adminLastName as string,
            adminPhone: data.adminPhone as string
          }
        }));
        if (isValid) {
          onSubmit();
          return;
        }
        break;
    }

    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Información Básica del Edificio";
      case 2:
        return "Características del Edificio";
      case 3:
        return "Contacto del Edificio";
      case 4:
        return "Información del Administrador";
      default:
        return "Información Básica del Edificio";
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <StepBasicInfo
          defaultValues={{
            buildingName: currentUser?.managedBuildings?.[0]?.name || currentUser?.user_metadata?.building?.name || formData.basicInfo.buildingName || '',
            address: currentUser?.managedBuildings?.[0]?.address || currentUser?.user_metadata?.building?.address || formData.basicInfo.address || ''
          }}
          onSubmit={(data) => {
            setFormData(prev => ({
              ...prev,
              basicInfo: {
                buildingName: data.buildingName || '',
                address: data.address || ''
              }
            }));
          }}
        />;
      case 2:
        return <StepCharacteristics
          defaultValues={formData.characteristics}
          onSubmit={(data) => {
            setFormData(prev => ({
              ...prev,
              characteristics: {
                floors: data.floors || '',
                totalUnits: data.totalUnits || '',
                constructionYear: data.constructionYear || ''
              }
            }));
          }}
        />;
      case 3:
        return <StepContact
          defaultValues={formData.contact}
          onSubmit={(data) => {
            setFormData(prev => ({
              ...prev,
              contact: {
                phoneNumber: data.phoneNumber || '',
                whatsapp: data.whatsapp || '',
                email: data.email || '',
                website: data.website || '',
                description: data.description || ''
              }
            }));
          }}
        />;
      case 4:
        return <StepAdmin
          defaultValues={formData.admin}
          onSubmit={(data) => {
            setFormData(prev => ({
              ...prev,
              admin: {
                adminFirstName: data.adminFirstName || '',
                adminLastName: data.adminLastName || '',
                adminPhone: data.adminPhone || ''
              }
            }));
          }}
        />;
      default:
        return <StepBasicInfo defaultValues={formData.basicInfo} />;
    }
  };

  return (
    <WizardLayout currentStep={currentStep} onStepClick={handleStepClick}>
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>{getStepTitle()}</CardTitle>
            <CardDescription>
              Por favor, complete la información solicitada para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
          <CardFooter className="flex justify-between">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="w-24"
              >
                Anterior
              </Button>
            )}
            <Button onClick={handleNext} className="w-24 ml-auto">
              {currentStep === 4 ? "Finalizar" : "Siguiente"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </WizardLayout>
  );
}

export default function Profile() {
  const { currentUser } = useAuth();

  if (currentUser?.role === 'BUILDING_ADMIN' || currentUser?.role === 'SUPER_ADMIN') {
    return <BuildingProfileWizard />;
  }

  return <UserProfile />;
}
