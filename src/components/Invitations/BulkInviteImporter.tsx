import React, { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileSpreadsheet, AlertCircle, Check, Loader2, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from '@/lib/supabase';
import { InvitationRole } from '@/types';
import { toast } from 'sonner';

interface Props {
    buildingId: string;
    onSuccess: () => void;
    unitsMap: Record<string, string>;
    existingInvitations: { unitId: string; role: InvitationRole; isResident: boolean }[];
}

interface ParsedRow {
    id: string;
    unitName: string;
    unitId?: string;
    email: string;
    role: InvitationRole;
    isResident: boolean;
    isValid: boolean;
    errorMessage?: string;
}

export function BulkInviteImporter({ buildingId, onSuccess, unitsMap, existingInvitations }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [allRows, setAllRows] = useState<any[]>([]); // Store all raw rows
    const [hasHeader, setHasHeader] = useState(true);
    const [mapping, setMapping] = useState({ unit: '', email: '', role: '' });
    const [step, setStep] = useState<'upload' | 'map' | 'review'>('upload');

    // New State for Review
    const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);

    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Derived state based on hasHeader toggle
    const headers = useMemo(() => {
        if (allRows.length === 0) return [];
        return hasHeader ? (allRows[0] as string[]) : allRows[0]?.map((_, i) => `Columna ${i + 1}`) || [];
    }, [allRows, hasHeader]);

    const dataRows = useMemo(() => {
        return hasHeader ? allRows.slice(1) : allRows;
    }, [allRows, hasHeader]);

    // Create options for Unit Select
    const unitOptions = useMemo(() => {
        return Object.entries(unitsMap)
            .map(([name, id]) => ({ name, id }))
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    }, [unitsMap]);

    const previewRows = useMemo(() => {
        return dataRows.slice(0, 5);
    }, [dataRows]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFile(file);

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
            setAllRows(data);
            setStep('map');
        };
        reader.readAsBinaryString(file);
    };

    const parseRole = (rawRole: string): { role: InvitationRole, isResident: boolean } => {
        const normalize = rawRole.toLowerCase().trim();

        if (normalize.includes('no reside')) return { role: InvitationRole.OWNER, isResident: false };
        if (normalize.includes('propietario') && normalize.includes('residente')) return { role: InvitationRole.OWNER, isResident: true };
        if (normalize.includes('inquilino') || normalize.includes('residente')) return { role: InvitationRole.RESIDENT, isResident: true };

        return { role: InvitationRole.OWNER, isResident: false };
    };

    // Validation Logic
    const validateRows = (rows: ParsedRow[]): ParsedRow[] => {
        // 1. Build map of used slots from DB
        const dbSlots: Record<string, { owner: boolean, resident: boolean }> = {};
        existingInvitations.forEach(inv => {
            if (!inv.unitId) return;
            if (!dbSlots[inv.unitId]) dbSlots[inv.unitId] = { owner: false, resident: false };
            if (inv.role === InvitationRole.OWNER) dbSlots[inv.unitId].owner = true;
            if (inv.isResident) dbSlots[inv.unitId].resident = true;
        });

        // 2. Validate against DB and Internal Conflicts
        return rows.map(row => {
            let error = '';
            // Basic checks
            if (!row.unitId) error = 'Seleccione una unidad';
            else if (!row.email || !row.email.includes('@')) error = 'Email inválido';
            else {
                const usesOwner = row.role === InvitationRole.OWNER;
                const usesResident = row.isResident;

                // Check strict slot conflicts with DB
                const dbSlot = dbSlots[row.unitId!] || { owner: false, resident: false };

                if (usesOwner && dbSlot.owner) error = 'Ya existe un Propietario para esta unidad (Registrado)';
                else if (usesResident && dbSlot.resident) error = 'Ya existe un Residente para esta unidad (Registrado)';
                else {
                    // Check Internal conflicts (with other rows in the same batch)
                    const otherRows = rows.filter(r => r.id !== row.id && r.unitId === row.unitId);
                    for (const other of otherRows) {
                        const otherUsesOwner = other.role === InvitationRole.OWNER;
                        const otherUsesResident = other.isResident;

                        if (usesOwner && otherUsesOwner) {
                            error = 'Conflicto: Múltiples propietarios para la misma unidad';
                            break;
                        }
                        if (usesResident && otherUsesResident) {
                            error = 'Conflicto: Múltiples residentes para la misma unidad';
                            break;
                        }
                    }
                }
            }

            return { ...row, isValid: !error, errorMessage: error };
        });
    };

    const handleContinueToReview = () => {
        const parsed: ParsedRow[] = dataRows.map((row: any) => {
            // Find index of selected headers
            const unitIndex = headers.indexOf(mapping.unit);
            const emailIndex = headers.indexOf(mapping.email);
            const roleIndex = mapping.role ? headers.indexOf(mapping.role) : -1;

            const unitName = String(row[unitIndex] || '').trim();
            const email = String(row[emailIndex] || '').trim();
            const rawRole = roleIndex !== -1 ? String(row[roleIndex] || '') : '';

            const unitId = unitsMap[unitName];
            const roleData = parseRole(rawRole);

            return {
                id: crypto.randomUUID(),
                unitName,
                unitId,
                email,
                role: roleData.role,
                isResident: roleData.isResident,
                isValid: true, // Will be re-validated immediately
            };
        });

        if (parsed.length === 0) {
            toast.error("No se encontraron datos para procesar.");
            return;
        }

        setParsedRows(validateRows(parsed));
        setStep('review');
    };

    const addNewRow = () => {
        const newRow: ParsedRow = {
            id: crypto.randomUUID(),
            unitName: '',
            unitId: undefined,
            email: '',
            role: InvitationRole.OWNER,
            isResident: false,
            isValid: false,
            errorMessage: 'Complete los datos'
        };
        setParsedRows(prev => validateRows([...prev, newRow]));
    };

    const updateRow = (id: string, updates: Partial<ParsedRow>) => {
        setParsedRows(prev => {
            const tempRows = prev.map(row => {
                if (row.id !== id) return row;
                const updatedRow = { ...row, ...updates };
                // If unitId is updated, update unitName as well
                if (updates.unitId) {
                    const option = unitOptions.find(u => u.id === updates.unitId);
                    if (option) updatedRow.unitName = option.name;
                }
                return updatedRow;
            });
            // Re-validate ALL rows because a change in one might resolve/create conflict in another
            return validateRows(tempRows);
        });
    };

    const deleteRow = (id: string) => {
        setParsedRows(prev => validateRows(prev.filter(r => r.id !== id)));
    };

    const handleFinalImport = async () => {
        if (!buildingId) return;

        const validRows = parsedRows.filter(r => r.isValid && r.unitId);
        if (validRows.length === 0) {
            toast.error("No hay filas válidas para importar.");
            return;
        }

        setIsImporting(true);
        try {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            const formattedData = validRows.map(row => ({
                buildingId,
                unitId: row.unitId!,
                email: row.email,
                role: row.role,
                isResident: row.isResident,
                token: crypto.randomUUID(),
                expiresAt: expiresAt.toISOString(),
                updatedAt: new Date().toISOString(),
                status: 'PENDING'
            }));

            const { error: insertError } = await supabase
                .from('platform_invitations')
                .insert(formattedData);

            if (insertError) throw insertError;

            // Optional: Trigger emails via Edge Function for each invitation
            formattedData.forEach(inv => {
                supabase.functions.invoke('send-email', {
                    body: {
                        email: inv.email,
                        token: inv.token,
                        role: inv.role,
                        isResident: inv.isResident,
                        buildingName: 'ConsorcioHub',
                        unitNumber: 'Unidad', // We'd need to lookup unit number if needed exactly
                    },
                }).catch(err => console.error('Failed to trigger email:', err));
            });

            toast.success(`Se enviaron ${formattedData.length} invitaciones correctamente.`);
            onSuccess();
        } catch (error: any) {
            console.error('Error importing:', error);
            toast.error("Error al importar: " + (error.message || "Error desconocido"));
        } finally {
            setIsImporting(false);
        }
    };

    const resetState = () => {
        setFile(null);
        setAllRows([]);
        setHasHeader(true);
        setMapping({ unit: '', email: '', role: '' });
        setStep('upload');
        setParsedRows([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="py-4 space-y-4">
            <DialogHeader>
                <DialogTitle>Importar Propietarios</DialogTitle>
                <DialogDescription>
                    {step === 'upload' && "Cargue un archivo Excel o CSV para asignar correos a las unidades masivamente."}
                    {step === 'map' && "Seleccione las columnas correspondientes en su archivo."}
                    {step === 'review' && "Revise y corrija los datos antes de enviar las invitaciones."}
                </DialogDescription>
            </DialogHeader>

            <div className="py-2">
                {step === 'upload' && (
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                        <Upload className="h-10 w-10 text-slate-400 mb-4" />
                        <Label htmlFor="file-upload" className="mb-2 text-lg font-medium cursor-pointer">
                            Seleccionar Archivo
                        </Label>
                        <Input
                            id="file-upload"
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                            Buscar en mi equipo
                        </Button>
                        <p className="text-xs text-slate-500 mt-2">Formatos: .xlsx, .xls, .csv</p>
                    </div>
                )}

                {step === 'map' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-blue-700 dark:text-blue-300">
                                    Se encontraron {dataRows.length} filas de datos.
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="has-header"
                                    checked={hasHeader}
                                    onCheckedChange={setHasHeader}
                                />
                                <Label htmlFor="has-header">La primera fila es cabecera</Label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Columna de UNIDAD</Label>
                                <Select
                                    value={mapping.unit}
                                    onValueChange={(val) => setMapping(prev => ({ ...prev, unit: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar columna" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {headers.map((h, i) => (
                                            <SelectItem key={i} value={h}>{h || `Columna ${i + 1}`}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Columna de EMAIL</Label>
                                <Select
                                    value={mapping.email}
                                    onValueChange={(val) => setMapping(prev => ({ ...prev, email: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar columna" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {headers.map((h, i) => (
                                            <SelectItem key={i} value={h}>{h || `Columna ${i + 1}`}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Columna de ROL (Opcional)</Label>
                                <Select
                                    value={mapping.role}
                                    onValueChange={(val) => setMapping(prev => ({ ...prev, role: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar columna" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {headers.map((h, i) => (
                                            <SelectItem key={i} value={h}>{h || `Columna ${i + 1}`}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-muted-foreground">
                                    Valores esperados: "Propietario (No Reside)", "Propietario y Residente", "Inquilino / Residente"
                                </p>
                            </div>
                        </div>

                        <div className="border rounded-md overflow-hidden">
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-xs font-medium border-b flex justify-between">
                                <span>Previsualización (Primeras 5 filas)</span>
                            </div>
                            <ScrollArea className="h-[150px]">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {headers.map((h, i) => (
                                                <TableHead key={i} className="h-8 text-xs font-bold">{h || `Col ${i + 1}`}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {previewRows.map((row: any, i) => (
                                            <TableRow key={i}>
                                                {headers.map((_, colIndex) => (
                                                    <TableCell key={colIndex} className="py-2 text-xs">
                                                        {row[colIndex]}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </div>
                    </div>
                )}

                {step === 'review' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">Revisar datos ({parsedRows.length} registros)</h3>
                            <div className="text-xs text-muted-foreground">
                                <span className={parsedRows.some(r => !r.isValid) ? "text-red-500" : "text-green-500"}>
                                    {parsedRows.filter(r => !r.isValid).length} inválidos
                                </span>
                            </div>
                        </div>

                        <div className="border rounded-md overflow-hidden">
                            <div className="flex bg-slate-100 dark:bg-slate-800 border-b">
                                <div className="flex-1 p-2 text-xs font-medium w-[120px]">Unidad</div>
                                <div className="flex-[2] p-2 text-xs font-medium">Email</div>
                                <div className="flex-1 p-2 text-xs font-medium w-[180px]">Rol</div>
                                <div className="w-[50px] p-2 text-xs font-medium"></div>
                            </div>
                            <ScrollArea className="h-[400px]">
                                <div className="divide-y">
                                    {parsedRows.map((row) => (
                                        <div key={row.id} className={`flex flex-col border-b last:border-0 ${!row.isValid ? "bg-red-50 dark:bg-red-900/10" : ""}`}>
                                            <div className="flex items-center">
                                                <div className="flex-1 p-2 w-[120px]">
                                                    <Select
                                                        value={row.unitId || ''}
                                                        onValueChange={(val) => updateRow(row.id, { unitId: val })}
                                                    >
                                                        <SelectTrigger className={`h-8 ${!row.unitId ? "border-red-500" : ""}`}>
                                                            <SelectValue placeholder="Unidad" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {unitOptions.map((opt) => (
                                                                <SelectItem key={opt.id} value={opt.id}>
                                                                    {opt.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex-[2] p-2">
                                                    <Input
                                                        value={row.email}
                                                        onChange={(e) => updateRow(row.id, { email: e.target.value })}
                                                        placeholder="email@ejemplo.com"
                                                        className={`h-8 ${!row.isValid && !row.email.includes('@') ? 'border-red-500' : ''}`}
                                                    />
                                                </div>
                                                <div className="flex-1 p-2 w-[180px]">
                                                    <Select
                                                        value={
                                                            row.role === InvitationRole.RESIDENT
                                                                ? 'RESIDENT'
                                                                : (row.isResident ? 'OWNER_RESIDENT' : 'OWNER')
                                                        }
                                                        onValueChange={(val) => {
                                                            if (val === 'RESIDENT') updateRow(row.id, { role: InvitationRole.RESIDENT, isResident: true });
                                                            else if (val === 'OWNER_RESIDENT') updateRow(row.id, { role: InvitationRole.OWNER, isResident: true });
                                                            else updateRow(row.id, { role: InvitationRole.OWNER, isResident: false });
                                                        }}
                                                    >
                                                        <SelectTrigger className="h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="OWNER">Propietario (No Reside)</SelectItem>
                                                            <SelectItem value="OWNER_RESIDENT">Propietario y Residente</SelectItem>
                                                            <SelectItem value="RESIDENT">Inquilino / Residente</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="w-[50px] p-2 flex justify-center">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100" onClick={() => deleteRow(row.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            {!row.isValid && row.errorMessage && (
                                                <div className="px-2 pb-2 text-[11px] text-red-600 font-medium flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {row.errorMessage}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        <Button variant="outline" size="sm" onClick={addNewRow} className="w-full border-dashed">
                            + Agregar Fila Manualmente
                        </Button>

                        {parsedRows.some(r => !r.isValid) && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Hay filas con errores (unidad no encontrada o email inválido). Corríjalas o elimínelas para continuar.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}
            </div>

            <DialogFooter>
                {step === 'upload' && (
                    <Button variant="ghost" onClick={onSuccess}>Cancelar</Button>
                )}
                {step === 'map' && (
                    <>
                        <Button variant="ghost" onClick={resetState} disabled={isImporting}>Cancelar</Button>
                        <Button
                            onClick={handleContinueToReview}
                            disabled={!mapping.unit || !mapping.email}
                        >
                            Continuar
                        </Button>
                    </>
                )}
                {step === 'review' && (
                    <>
                        <Button variant="ghost" onClick={() => setStep('map')} disabled={isImporting}>Atrás</Button>
                        <Button
                            onClick={handleFinalImport}
                            disabled={parsedRows.some(r => !r.isValid) || isImporting || parsedRows.length === 0}
                        >
                            {isImporting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Check className="mr-2 h-4 w-4" />
                            )}
                            Confirmar Invitaciones
                        </Button>
                    </>
                )}
            </DialogFooter>
        </div>
    );
}
