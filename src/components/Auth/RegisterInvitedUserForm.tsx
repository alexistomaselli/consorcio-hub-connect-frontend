
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { PlatformInvitation } from '@/types';
import { supabase } from '@/lib/supabase';

interface RegisterInvitedUserFormData {
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
}

interface Props {
    invitation: PlatformInvitation;
    email: string;
}

const RegisterInvitedUserForm = ({ invitation, email }: Props) => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<RegisterInvitedUserFormData>({
        defaultValues: {
            firstName: '',
            lastName: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: RegisterInvitedUserFormData) => {
        if (data.password !== data.confirmPassword) {
            toast({
                title: 'Error',
                description: 'Las contraseñas no coinciden',
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsSubmitting(true);

            // 1. Sign up user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password: data.password,
                options: {
                    data: {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        role: invitation.role, // 'OWNER' or 'RESIDENT'
                        buildingId: invitation.buildingId,
                        isProfileComplete: true, // Assuming basic info provided is enough
                    },
                },
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Accept invitation and link to unit
                const userId = authData.user.id;

                // Update Unit
                const updates: any = {};
                if (invitation.role === 'OWNER') {
                    updates.ownerId = userId;
                } else if (invitation.role === 'RESIDENT') {
                    updates.tenantId = userId;
                }

                // If isResident is true, it means they also live there
                if (invitation.isResident) {
                    updates.tenantId = userId;
                }

                const { error: unitError } = await supabase
                    .from('units')
                    .update(updates)
                    .eq('id', invitation.unitId);

                if (unitError) throw unitError;

                // Update Invitation Status
                const { error: inviteError } = await supabase
                    .from('platform_invitations')
                    .update({ status: 'ACCEPTED' })
                    .eq('id', invitation.id);

                if (inviteError) throw inviteError;

                toast({
                    title: 'Registro exitoso',
                    description: 'Bienvenido a ConsorcioHub',
                });

                // 3. Navigate
                navigate('/login');
            }
        } catch (error: any) {
            console.error('Error accepting invitation:', error);
            toast({
                title: 'Error',
                description: error.message || 'Ocurrió un error al procesar el registro',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-md mb-6 border border-slate-200">
                    <p className="text-sm font-medium text-slate-700 mb-1">Registrando como:</p>
                    <p className="text-lg font-bold text-slate-900">{email}</p>
                    <p className="text-sm text-slate-500 mt-1">
                        Rol: {invitation.role === 'OWNER' ? 'Propietario' : 'Inquilino/Residente'}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="firstName"
                        rules={{ required: 'El nombre es requerido' }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl>
                                    <Input placeholder="Juan" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="lastName"
                        rules={{ required: 'El apellido es requerido' }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Apellido</FormLabel>
                                <FormControl>
                                    <Input placeholder="Pérez" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="password"
                        rules={{ required: 'La contraseña es requerida', minLength: { value: 6, message: 'Mínimo 6 caracteres' } }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contraseña</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="******" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        rules={{ required: 'Confirme su contraseña' }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirmar Contraseña</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="******" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Procesando...' : 'Completar Registro'}
                </Button>
            </form>
        </Form>
    );
};

export default RegisterInvitedUserForm;
