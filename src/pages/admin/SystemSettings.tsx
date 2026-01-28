import { useState, useEffect, useRef } from 'react';
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
    smtpHost: z.string().min(1, 'Host requerido'),
    smtpPort: z.string().min(1, 'Puerto requerido'),
    smtpUser: z.string().email('Email inválido'),
    smtpPass: z.string().min(1, 'Contraseña requerida'),
});

type FormData = z.infer<typeof formSchema>;

export default function SystemSettings() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testEmail, setTestEmail] = useState('');

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            evolutionApiUrl: '',
            evolutionApiKey: '',
            smtpHost: 'smtp.gmail.com',
            smtpPort: '587',
            smtpUser: '',
            smtpPass: '',
        },
    });

    const hasLoaded = useRef(false);

    useEffect(() => {
        if (!currentUser) return;

        if (currentUser.role !== 'SUPER_ADMIN') {
            navigate('/dashboard');
            return;
        }

        if (!hasLoaded.current) {
            hasLoaded.current = true;
            loadSettings();
        }
    }, [currentUser, navigate]);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('system_settings')
                .select('*')
                .in('key', ['evolution_api_url', 'evolution_api_key', 'smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass']);

            if (error) throw error;

            if (data) {
                const settingsMap = data.reduce((acc, curr) => {
                    acc[curr.key] = curr.value;
                    return acc;
                }, {} as Record<string, string>);

                form.reset({
                    evolutionApiUrl: settingsMap['evolution_api_url'] || '',
                    evolutionApiKey: settingsMap['evolution_api_key'] || '',
                    smtpHost: settingsMap['smtp_host'] || 'smtp.gmail.com',
                    smtpPort: settingsMap['smtp_port'] || '587',
                    smtpUser: settingsMap['smtp_user'] || '',
                    smtpPass: settingsMap['smtp_pass'] || '',
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
                    updatedAt: new Date().toISOString(),
                },
                {
                    key: 'evolution_api_key',
                    value: values.evolutionApiKey,
                    description: 'API Key Global de Evolution API',
                    updatedAt: new Date().toISOString(),
                },
                {
                    key: 'smtp_host',
                    value: values.smtpHost,
                    description: 'SMTP Host',
                    updatedAt: new Date().toISOString(),
                },
                {
                    key: 'smtp_port',
                    value: values.smtpPort,
                    description: 'SMTP Port',
                    updatedAt: new Date().toISOString(),
                },
                {
                    key: 'smtp_user',
                    value: values.smtpUser,
                    description: 'SMTP User',
                    updatedAt: new Date().toISOString(),
                },
                {
                    key: 'smtp_pass',
                    value: values.smtpPass,
                    description: 'SMTP App Password',
                    updatedAt: new Date().toISOString(),
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
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Integración Evolution API</CardTitle>
                                <CardDescription>
                                    Configura la conexión con el servicio de WhatsApp (Evolution API).
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Configuración SMTP (Email)</CardTitle>
                                <CardDescription>
                                    Configura el servidor de correo para enviar invitaciones y notificaciones del sistema.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="smtpHost"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Servidor SMTP</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="smtp.gmail.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="smtpPort"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Puerto</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="587" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="smtpUser"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Usuario (Email)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="tu-email@gmail.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="smtpPass"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Contraseña de Aplicación</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="xxxx xxxx xxxx xxxx" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Usa una "App Password" de Google, no tu contraseña personal.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex items-end gap-4 p-4 border rounded-lg bg-muted/50">
                            <div className="flex-1 space-y-2">
                                <FormLabel>Email de Prueba</FormLabel>
                                <Input
                                    placeholder="ejemplo@correo.com"
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                />
                                <p className="text-[0.8rem] text-muted-foreground">
                                    Envía un correo de prueba a esta dirección para verificar el SMTP.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={async () => {
                                    if (!testEmail) {
                                        alert('Por favor ingresa un email de prueba.');
                                        return;
                                    }
                                    try {
                                        setSaving(true);
                                        const { error } = await supabase.functions.invoke('send-email', {
                                            body: {
                                                email: testEmail,
                                                test: true
                                            }
                                        });
                                        if (error) {
                                            alert('Error al enviar correo de prueba: ' + error.message);
                                        } else {
                                            alert('¡Correo de prueba enviado con éxito! Revisa tu bandeja de entrada.');
                                        }
                                    } catch (e: any) {
                                        alert('Error: ' + e.message);
                                    } finally {
                                        setSaving(false);
                                    }
                                }}
                            >
                                Probar Configuración SMTP
                            </Button>
                        </div>

                        <div className="flex justify-end mt-4">
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
            </div>
        </div >
    );
}
