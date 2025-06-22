import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center pt-24 px-4">
      <div className="w-full max-w-md p-6 space-y-4 bg-muted rounded-lg border">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Acceso no autorizado
          </h2>
          <p className="text-muted-foreground mb-4">
            Debes iniciar sesión para acceder a esta página.
          </p>
          <Button onClick={() => navigate("/login")} className="w-full">
            Iniciar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
