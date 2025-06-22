import { Button } from "@/components/ui/button";
import { Building } from "@/types";
import { Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const getInitials = (firstName?: string, lastName?: string) => {
  if (!firstName || !lastName) return '';
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
};

const getRandomColor = () => {
  const colors = [
    'bg-red-500',
    'bg-green-500',
    'bg-blue-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

interface BuildingTableProps {
  buildings: Building[];
  onEdit?: (building: Building) => void;
  onDelete?: (building: Building) => void;
}

export function BuildingTable({ buildings, onEdit, onDelete }: BuildingTableProps) {
  return (
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium">Admin</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Nombre</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Dirección</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Ciudad</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Estado</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {buildings.map((building) => (
              <tr
                key={building.id}
                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
              >
                <td className="p-4 align-middle">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className={getRandomColor()}>
                        {getInitials(building.admin?.firstName, building.admin?.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {building.admin?.firstName} {building.admin?.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {building.admin?.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 align-middle">{building.name}</td>
                <td className="p-4 align-middle">{building.address}</td>
                <td className="p-4 align-middle">{building.city}</td>
                <td className="p-4 align-middle">{building.state}</td>
                <td className="p-4 align-middle">
                  <div className="flex gap-2">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(building)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(building)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
