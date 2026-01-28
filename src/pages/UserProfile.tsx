import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

export default function UserProfile() {
    const { currentUser, updateUser } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // For now, this is a simple view. We can add edit functionality later.

    return (
        <div className="container mx-auto py-6 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Mi Perfil</CardTitle>
                    <CardDescription>
                        Información de tu cuenta personal.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input value={currentUser?.firstName || ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label>Apellido</Label>
                        <Input value={currentUser?.lastName || ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={currentUser?.email || ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label>Rol</Label>
                        <div className="px-3 py-2 border rounded-md bg-slate-50 text-sm text-slate-500 capitalize">
                            {currentUser?.role?.replace('_', ' ').toLowerCase()}
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    {/* Future: Add 'Edit' button or Password Change */}
                    <p className="text-sm text-muted-foreground">Para modificar estos datos contacte a la administración.</p>
                </CardFooter>
            </Card>
        </div>
    );
}
