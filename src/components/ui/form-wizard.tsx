import { Button } from "./button";

interface FormWizardProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  isLastStep: boolean;
  isSubmitting?: boolean;
  children: React.ReactNode;
}

export function FormWizard({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  isLastStep,
  isSubmitting,
  children,
}: FormWizardProps) {
  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    onNext();
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    onPrevious();
  };
  const steps = [
    { number: 1, title: "Información Básica" },
    { number: 2, title: "Características" },
    { number: 3, title: "Contacto" },
    { number: 4, title: "Administrador" },
  ];

  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <div className="relative">
        <div className="flex justify-between mb-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`flex flex-col items-center ${
                currentStep >= step.number
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2 ${
                  currentStep >= step.number
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground"
                }`}
              >
                {step.number}
              </div>
              <span className="text-sm font-medium">{step.title}</span>
            </div>
          ))}
        </div>
        <div className="absolute top-4 left-0 right-0 h-[2px] bg-muted-foreground -z-10">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Form content */}
      <div className="min-h-[400px]">{children}</div>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          Anterior
        </Button>
        <Button
          type={isLastStep ? "submit" : "button"}
          onClick={isLastStep ? undefined : handleNext}
          disabled={isSubmitting}
        >
          {isLastStep
            ? isSubmitting
              ? "Guardando..."
              : "Guardar Información"
            : "Siguiente"}
        </Button>
      </div>
    </div>
  );
}
