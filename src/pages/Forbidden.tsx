import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">Acceso Denegado</h1>
        <p className="text-lg text-muted-foreground">
          No tienes permiso para acceder a esta página
        </p>
        <Button onClick={() => navigate(-1)}>Volver</Button>
      </div>
    </div>
  );
};

export default Forbidden;
