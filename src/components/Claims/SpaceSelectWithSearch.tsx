import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Space {
  id: string;
  name: string;
  type: {
    id: string;
    name: string;
    description?: string;
    isReservable: boolean;
    isAssignable: boolean;
  };
  floor?: string;
  description?: string;
}

interface SpaceSelectWithSearchProps {
  spaces: Space[];
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function SpaceSelectWithSearch({
  spaces,
  value,
  onChange,
  disabled = false,
  placeholder = "Selecciona un espacio"
}: SpaceSelectWithSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSpaces, setFilteredSpaces] = useState<Space[]>(spaces);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Actualizar espacios filtrados cuando cambia la búsqueda o los espacios
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSpaces(spaces);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = spaces.filter(space =>
      space.name.toLowerCase().includes(query) ||
      (space.floor?.toLowerCase().includes(query) || false) ||
      (space.type?.name?.toLowerCase().includes(query) || false)
    );

    setFilteredSpaces(filtered);
  }, [searchQuery, spaces]);

  // Enfocar el input cuando se abre el dropdown
  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 10);
    }
  }, [open]);

  // Cerrar el dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Nombre del espacio seleccionado
  const selectedSpace = spaces.find(space => space.id === value);
  
  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Botón para abrir/cerrar el dropdown */}
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn(
          "w-full justify-between font-normal",
          !value && "text-muted-foreground"
        )}
        onClick={() => {
          setOpen(!open);
          if (!open) {
            setSearchQuery('');
          }
        }}
        disabled={disabled}
      >
        {selectedSpace ? (
          <span>{selectedSpace.name} {selectedSpace.floor ? `(${selectedSpace.floor})` : ''}</span>
        ) : (
          <span>{placeholder}</span>
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {/* Dropdown con buscador y opciones */}
      {open && (
        <div className="absolute bottom-full left-0 right-0 z-[1000] mb-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white text-base shadow-lg focus:outline-none" style={{ maxHeight: '300px' }}>
          {/* Input de búsqueda */}
          <div className="sticky top-0 z-10 bg-white p-2 border-b">
            <input
              type="text"
              ref={searchInputRef}
              autoFocus
              placeholder="Buscar espacio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          
          {/* Lista de opciones */}
          <div className="overflow-y-auto" style={{ maxHeight: '240px' }}>
            {filteredSpaces.length > 0 ? (
              filteredSpaces.map((space) => (
                <div
                  key={space.id}
                  className={cn(
                    "flex items-center justify-between px-2 py-2 cursor-pointer hover:bg-gray-100",
                    value === space.id && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => {
                    onChange(space.id);
                    setOpen(false);
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between w-full">
                      <span>{space.name} {space.floor ? `(${space.floor})` : ''}</span>
                      <span className="ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800">
                        {space.type?.name || 'Espacio'}
                      </span>
                    </div>
                  </div>
                  {value === space.id && (
                    <Check className="ml-2 h-4 w-4 shrink-0" />
                  )}
                </div>
              ))
            ) : (
              <div className="px-2 py-2 text-sm text-muted-foreground">
                No se encontraron espacios
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
