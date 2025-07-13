import React from 'react';
import { Check } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: number;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  disabled?: boolean;
}

const plans: Plan[] = [
  {
    name: "FREE",
    price: 0,
    description: "Prueba todas las funcionalidades",
    features: [
      { text: "Gestión de reclamos", included: true },
      { text: "Panel de administración", included: true },
      { text: "Notificaciones básicas", included: true },
      { text: "Soporte por email", included: true },
      { text: "14 días de prueba", included: true },
    ]
  },
  {
    name: "BASIC",
    price: 15,
    description: "Para edificios pequeños",
    features: [
      { text: "Todo lo del plan Free", included: true },
      { text: "Sin límite de tiempo", included: true },
      { text: "Hasta 20 unidades", included: true },
      { text: "Soporte prioritario", included: true },
      { text: "Reportes básicos", included: true },
    ]
  },
  {
    name: "PRO",
    price: 29,
    description: "Para edificios medianos",
    features: [
      { text: "Todo lo del plan Basic", included: true },
      { text: "Hasta 50 unidades", included: true },
      { text: "Reportes avanzados", included: true },
      { text: "Soporte telefónico", included: true },
      { text: "Personalización", included: true },
    ],
    popular: true
  }
];

interface PlanSelectorProps {
  onPlanSelect?: (plan: Plan) => void;
}

export function PlanSelector({ onPlanSelect }: PlanSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-full overflow-hidden">
      {plans.map((plan) => (
        <Card 
          key={plan.name}
          className={cn(
            "flex flex-col",
            plan.popular && "border-blue-600",
            plan.disabled && "opacity-60"
          )}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </div>
              {plan.popular && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Más elegido
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex items-baseline mb-4">
              <span className="text-3xl font-bold">${plan.price}</span>
              <span className="text-sm text-gray-500 ml-1">/mes</span>
            </div>
            <ul className="space-y-2 text-sm">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              variant={plan.popular ? "default" : "outline"}
              disabled={plan.disabled}
              onClick={() => onPlanSelect?.(plan)}
            >
              {plan.disabled ? 'Próximamente' : 'Seleccionar plan'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
