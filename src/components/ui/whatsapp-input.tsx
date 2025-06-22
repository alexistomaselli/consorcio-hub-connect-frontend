import React from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface WhatsAppInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const WhatsAppInput = React.forwardRef<HTMLInputElement, WhatsAppInputProps>(({ className, error, ...props }, ref) => {
  return (
    <div className="relative flex items-center">
      <div className="absolute left-3 flex items-center gap-1 pointer-events-none">
        <img 
          src="https://flagcdn.com/w20/ar.png" 
          alt="Argentina" 
          className="h-4 w-6 object-cover rounded"
        />
        <span className="text-sm text-gray-500">+54</span>
      </div>
      <Input
        type="tel"
        ref={ref}
        className={cn(
          'pl-20',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
    </div>
  );
})

export function formatWhatsApp(number: string): string {
  // Eliminar todo excepto números
  const cleaned = number.replace(/\D/g, '');
  
  // Si empieza con 54, lo quitamos
  const withoutCountryCode = cleaned.startsWith('54') ? cleaned.slice(2) : cleaned;
  
  // Si empieza con 9, lo mantenemos (WhatsApp Argentina)
  // Si no empieza con 9, lo agregamos
  const withNine = withoutCountryCode.startsWith('9') ? 
    withoutCountryCode : 
    '9' + withoutCountryCode;
  
  return '+54' + withNine;
}

export function validateWhatsApp(number: string): boolean {
  // Eliminar todo excepto números
  const cleaned = number.replace(/\D/g, '');
  
  // Debe tener entre 12 y 13 dígitos (54 + 9 + área + número)
  if (cleaned.length < 12 || cleaned.length > 13) {
    return false;
  }
  
  // Debe empezar con 54 o tener el formato correcto para agregarle 54
  const withCountryCode = cleaned.startsWith('54') ? 
    cleaned : 
    '54' + cleaned;
  
  // Validar que después del 54 venga un 9
  return withCountryCode.slice(2, 3) === '9';
}
