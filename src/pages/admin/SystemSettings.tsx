import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
    evolutionApiUrl: z.string().url('Debe ser una URL válida'),
    evolutionApiKey: z.string().min(1, 'La API Key es requerida'),
});

type FormData = z.infer<typeof formSchema>;

export default function SystemSettings() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            evolutionApiUrl: '',
            evolutionApiKey: '',
        },
    });

    useEffect(() => {
        if (!currentUser) return;

        if (currentUser.role !== 'SUPER_ADMIN') {
            navigate('/dashboard');
            return;
        }

        loadSettings();
    }, [currentUser, navigate]);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('system_settings')
                .select('*')
                .in('key', ['evolution_api_url', 'evolution_api_key']);

            if (error) throw error;

            if (data) {
                const settingsMap = data.reduce((acc, curr) => {
                    acc[curr.key] = curr.value;
                    return acc;
                }, {} as Record<string, string>);

                form.reset({
                    evolutionApiUrl: settingsMap['evolution_api_url'] || '',
                    evolutionApiKey: settingsMap['evolution_api_key'] || '',
                });
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (values: FormData) => {
        try {
            setSaving(true);

            const updates = [
                {
                    key: 'evolution_api_url',
                    value: values.evolutionApiUrl,
                    description: 'URL de la instancia de Evolution API',
                    updated_at: new Date().toISOString(),
                },
                {
                    key: 'evolution_api_key',
                    value: values.evolutionApiKey,
                    description: 'API Key Global de Evolution API',
                    updated_at: new Date().toISOString(),
                }
            ];

            const { error } = await supabase
                .from('system_settings')
                .upsert(updates);

            if (error) throw error;

            // Optional: Show success toast
        } catch (error) {
            console.error('Error saving settings:', error);
            // Optional: Show error toast
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Configuración Global</h1>
                    <p className="text-muted-foreground">
                        Ajustes del sistema aplicables a todos los usuarios.
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Integración Evolution API</CardTitle>
                        <CardDescription>
                            Configura la conexión con el servicio de WhatsApp (Evolution API).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="evolutionApiUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>URL de la API</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://api.tu-evolution.com" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    La URL base donde está alojada la instancia de Evolution API.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="evolutionApiKey"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Global API Key</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="Tu API Key Global" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    La clave API global para autenticar las peticiones.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={saving}>
                                        {saving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Guardar Cambios
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
