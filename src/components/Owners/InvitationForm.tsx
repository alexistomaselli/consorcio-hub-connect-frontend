import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DocumentType } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InvitationFormData {
  firstName: string;
  lastName: string;
  whatsappNumber: string;
  documentType: DocumentType;
  documentNumber: string;
  units: string[];
  aiAgent: {
    enabled: boolean;
    preferences: {
      claims: boolean;
      expenses: boolean;
      documents: boolean;
      meetings: boolean;
    };
  };
}

interface InvitationFormProps {
  buildingId: string;
  availableUnits: Array<{
    id: string;
    number: string;
    floor: string;
  }>;
  onSubmit: (data: InvitationFormData) => Promise<void>;
}

export const InvitationForm: React.FC<InvitationFormProps> = ({
  buildingId,
  availableUnits,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InvitationFormData>({
    defaultValues: {
      aiAgent: {
        enabled: false,
        preferences: {
          claims: true,
          expenses: true,
          documents: true,
          meetings: true
        }
      }
    }
  });

  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);

  const handleFormSubmit = async (data: InvitationFormData) => {
    try {
      await onSubmit({
        ...data,
        units: selectedUnits,
        aiAgent: {
          enabled: true,  // Habilitado por defecto
          preferences: {
            claims: true,
            expenses: true,
            documents: true,
            meetings: true
          }
        }
      });
      reset();
      setSelectedUnits([]);
    } catch (error) {
      console.error('Error al enviar invitación:', error);
    }
  };

  const toggleUnit = (unitId: string) => {
    setSelectedUnits(prev =>
      prev.includes(unitId)
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700" htmlFor="firstName">
            Nombre
          </label>
          <Input
            id="firstName"
            type="text"
            {...register('firstName', {
              required: 'El nombre es requerido',
            })}
          />
          {errors.firstName?.message && (
            <p className="text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700" htmlFor="lastName">
            Apellido
          </label>
          <Input
            id="lastName"
            type="text"
            {...register('lastName', {
              required: 'El apellido es requerido',
            })}
          />
          {errors.lastName?.message && (
            <p className="text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700" htmlFor="whatsappNumber">
          Número de WhatsApp
        </label>
        <Input
          id="whatsappNumber"
          type="tel"
          placeholder="+54 9 11 1234-5678"
          {...register('whatsappNumber', {
            required: 'El número de WhatsApp es requerido',
            pattern: {
              value: /^\+?[1-9]\d{1,14}$/,
              message: 'Número inválido',
            },
          })}
        />
        {errors.whatsappNumber?.message && (
          <p className="text-sm text-red-600">{errors.whatsappNumber.message}</p>
        )}
        <p className="text-sm text-gray-500">
          Se enviará un código de validación a este número
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="documentType">
              Tipo de Documento
            </label>
            <Select onValueChange={value => {
              const event = { target: { name: 'documentType', value } };
              register('documentType').onChange(event);
            }}>
              <SelectTrigger id="documentType">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DNI">DNI</SelectItem>
                <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                <SelectItem value="CUIT">CUIT</SelectItem>
                <SelectItem value="CUIL">CUIL</SelectItem>
                <SelectItem value="OTHER">Otro</SelectItem>
              </SelectContent>
            </Select>
            {errors.documentType?.message && (
              <p className="text-sm text-red-600">{errors.documentType.message}</p>
            )}
          </div>
        </div>

        <div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="documentNumber">
              Número de Documento
            </label>
            <Input
              id="documentNumber"
              {...register('documentNumber', {
                required: 'El número de documento es requerido',
              })}
            />
            {errors.documentNumber?.message && (
              <p className="text-sm text-red-600">{errors.documentNumber.message}</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Unidades
        </label>
        <div className="grid grid-cols-3 gap-2">
          {availableUnits.map(unit => (
            <button
              key={unit.id}
              type="button"
              onClick={() => toggleUnit(unit.id)}
              className={`p-2 text-sm rounded-lg border ${
                selectedUnits.includes(unit.id)
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {unit.floor}-{unit.number}
            </button>
          ))}
        </div>
        {selectedUnits.length === 0 && (
          <p className="mt-1 text-sm text-red-600">
            Seleccione al menos una unidad
          </p>
        )}
      </div>

      <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
        <h3 className="font-medium">Configuración del Agente IA</h3>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="aiEnabled"
            {...register('aiAgent.enabled')}
            className="rounded border-gray-300"
          />
          <label htmlFor="aiEnabled" className="text-sm">
            Habilitar asistente virtual
          </label>
        </div>

        {watch('aiAgent.enabled') && (
          <div className="space-y-2 pl-6">
            <p className="text-sm text-gray-600">Permisos del asistente:</p>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('aiAgent.preferences.claims')}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Reclamos</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('aiAgent.preferences.expenses')}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Expensas</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('aiAgent.preferences.documents')}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Documentos</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('aiAgent.preferences.meetings')}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Reuniones</span>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="submit"
          disabled={isSubmitting || selectedUnits.length === 0}
          className={isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Invitación'}
        </Button>
      </div>
    </form>
  );
};
