import React, { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import MyPropertiesDashboard from './MyPropertiesDashboard';
import { useClaims } from '@/context/ClaimsContext';
import {
  Wallet,
  Wrench,
  Home,
  ChevronRight,
  FileText,
  AlertTriangle,
  Calendar,
  Megaphone,
  Plus,
  UserPlus,
  CreditCard
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { claims } = useClaims();

  if (currentUser?.role === 'OWNER' || currentUser?.role === 'RESIDENT') {
    return <MyPropertiesDashboard />;
  }

  const buildingClaims = useMemo(() => {
    if (!currentUser?.buildingId) return [];
    return claims.filter(claim => claim.buildingId === currentUser.buildingId);
  }, [claims, currentUser]);

  // Stats calculation
  const activeClaims = buildingClaims.filter(c => c.status === 'pending' || c.status === 'in_progress');
  const resolvedClaims = buildingClaims.filter(c => c.status === 'resolved');
  const highPriorityClaims = activeClaims.filter(c => c.priority === 'high');

  const currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Hola, {currentUser?.firstName} <span className="text-2xl">👋</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Aquí tienes el resumen de hoy, {currentDate}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-1 rounded-lg border shadow-sm">
          <select
            className="bg-transparent text-sm font-medium border-none focus:ring-0 cursor-pointer py-1 px-2 text-gray-700"
            defaultValue={currentUser?.buildingName || "Edificio Principal"}
          >
            <option>{currentUser?.buildingName || "Edificio Principal"}</option>
          </select>
          <Button size="sm" className="h-8 w-8 p-0 rounded-md bg-consorcio-blue hover:bg-blue-700">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Financial Card */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-green-100/50 rounded-lg text-green-600">
                <Wallet className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Mensual</span>
            </div>
            <p className="text-sm text-gray-500 font-medium">Expensas Cobradas</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-bold text-gray-900">$ 1.250.000</h3>
              <span className="text-xs text-gray-400">de $ 1.5M</span>
            </div>
            <div className="mt-4">
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[83%] rounded-full"></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>83% Cobrado</span>
                <span>17% Pendiente</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Claims Card */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-orange-100/50 rounded-lg text-orange-600">
                <Wrench className="h-6 w-6" />
              </div>
              <Button variant="ghost" size="sm" className="h-6 text-xs text-consorcio-blue hover:text-blue-700 px-0">Ver todos</Button>
            </div>
            <p className="text-sm text-gray-500 font-medium">Reclamos Activos</p>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-2xl font-bold text-gray-900">{activeClaims.length}</h3>
              <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                -2 vs mes pasado
              </span>
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-dashed">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  <span className="text-xs text-gray-500">Alta Prioridad</span>
                </div>
                <p className="text-sm font-semibold ml-3.5">{highPriorityClaims.length}</p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-consorcio-blue"></div>
                  <span className="text-xs text-gray-500">Resueltos</span>
                </div>
                <p className="text-sm font-semibold ml-3.5">{resolvedClaims.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Occupancy Card */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-100/50 rounded-lg text-consorcio-blue">
                <Home className="h-6 w-6" />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative w-16 h-16 flex items-center justify-center rounded-full border-4 border-gray-100 border-l-consorcio-blue border-t-consorcio-blue transform -rotate-45">
                <span className="text-xs font-bold text-gray-900 transform rotate-45">98%</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Ocupación Total</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">49/50</h3>
                <p className="text-xs text-gray-400">Unidades Ocupadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Activity Feed (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-md h-full">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900 text-lg">Últimos Movimientos</h3>
                <Button variant="ghost" size="sm" className="text-consorcio-blue">Ver todo</Button>
              </div>

              <div className="space-y-6">
                {/* Mock Event 1 */}
                <div className="flex gap-4 items-start group">
                  <div className="p-2 rounded-full bg-green-50 text-green-600 group-hover:bg-green-100 transition-colors">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-semibold text-gray-900 text-sm">Pago recibido</p>
                      <span className="text-xs text-gray-400">Hace 5 min</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Unidad 4B abonó $15.000 (Expensas Octubre)</p>
                  </div>
                </div>

                {/* Mock Event 2 */}
                <div className="flex gap-4 items-start group">
                  <div className="p-2 rounded-full bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-colors">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-semibold text-gray-900 text-sm">Nuevo reclamo urgente</p>
                      <span className="text-xs text-gray-400">Hace 25 min</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Unidad 1A reportó: "Pérdida de agua en el baño principal"</p>
                  </div>
                </div>

                {/* Mock Event 3 */}
                <div className="flex gap-4 items-start group">
                  <div className="p-2 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-semibold text-gray-900 text-sm">Reserva confirmada</p>
                      <span className="text-xs text-gray-400">Hace 1 hora</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Roberto Diaz (3C) reservó el SUM para el Sábado 12</p>
                  </div>
                </div>

                {/* Mock Event 4 */}
                <div className="flex gap-4 items-start group">
                  <div className="p-2 rounded-full bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-semibold text-gray-900 text-sm">Comunicado enviado</p>
                      <span className="text-xs text-gray-400">Hace 3 horas</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Se envió recordatorio de "Fumigación Mensual" a todos los residentes.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Quick Actions & Alerts (Span 1) */}
        <div className="space-y-6">

          {/* Action Center */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold text-gray-900 mb-4">Centro de Acción</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 border-gray-100 shadow-sm">
                <div className="p-2 bg-blue-50 text-consorcio-blue rounded-md">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold block text-gray-700">Generar</span>
                  <span className="text-xs text-gray-500">Expensas</span>
                </div>
              </Button>

              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 border-gray-100 shadow-sm">
                <div className="p-2 bg-blue-50 text-consorcio-blue rounded-md">
                  <Plus className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold block text-gray-700">Nuevo</span>
                  <span className="text-xs text-gray-500">Comunicado</span>
                </div>
              </Button>

              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 border-gray-100 shadow-sm">
                <div className="p-2 bg-blue-50 text-consorcio-blue rounded-md">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold block text-gray-700">Pago</span>
                  <span className="text-xs text-gray-500">Manual</span>
                </div>
              </Button>

              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 border-gray-100 shadow-sm">
                <div className="p-2 bg-blue-50 text-consorcio-blue rounded-md">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold block text-gray-700">Nuevo</span>
                  <span className="text-xs text-gray-500">Residente</span>
                </div>
              </Button>
            </div>
          </div>

          {/* Urgent Alerts */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-semibold text-sm">Atención Urgente</span>
              </div>
              <span className="bg-white text-red-700 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">3</span>
            </div>
            <div className="divide-y divide-gray-50">
              {/* Alert Item 1 */}
              <div className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-red-600">Reclamo Vencido</span>
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Reparación portón cochera</h4>
                <p className="text-xs text-gray-500 mt-1">Venció hace 2 días • Asignado a Juan P.</p>
              </div>

              {/* Alert Item 2 */}
              <div className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-red-600">Deuda Crítica</span>
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Unidad 6A - 3 Meses impagos</h4>
                <p className="text-xs text-gray-500 mt-1">Total: $125.000 • Enviar aviso legal</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
