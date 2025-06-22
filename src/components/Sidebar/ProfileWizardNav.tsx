import { cn } from "@/lib/utils";
import { Building, Contact, User2, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function ProfileWizardNav({ currentStep, onStepClick }: Props) {
  const steps = [
    {
      number: 1,
      title: "Información Básica",
      icon: Building,
      description: "Nombre y dirección del edificio"
    },
    {
      number: 2,
      title: "Características",
      icon: ListChecks,
      description: "Pisos, unidades y año"
    },
    {
      number: 3,
      title: "Contacto",
      icon: Contact,
      description: "Teléfono, email y web"
    },
    {
      number: 4,
      title: "Administrador",
      icon: User2,
      description: "Datos del administrador"
    }
  ];

  const handleStepClick = (stepNumber: number) => {
    if (onStepClick && stepNumber <= currentStep) {
      onStepClick(stepNumber);
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div className="px-4 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Completar Perfil
        </h2>
        <div className="space-y-1">
          {steps.map((step) => {
            const isActive = currentStep === step.number;
            const isAccessible = step.number <= currentStep;
            const StepIcon = step.icon;

            return (
              <div key={step.number} className="flex items-center p-2">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-4",
                    !isAccessible && "opacity-50 cursor-not-allowed",
                    isActive && "text-blue-600"
                  )}
                  onClick={() => handleStepClick(step.number)}
                  disabled={!isAccessible}
                >
                  <div className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm font-medium",
                    isActive && "border-blue-600 bg-blue-600 text-white",
                    !isActive && isAccessible && "border-blue-200 text-blue-600",
                    !isAccessible && "border-gray-200 text-gray-400"
                  )}>
                    {step.number}
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <span className={cn(
                      "font-medium text-sm truncate w-full",
                      isActive && "text-blue-600"
                    )}>{step.title}</span>
                    <span className="text-xs text-gray-500 truncate w-full">{step.description}</span>
                  </div>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
