import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ClaimsProvider } from "@/context/ClaimsContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProfileRequiredRoute from "@/components/ProfileRequiredRoute";
import EmailVerificationGuard from "@/guards/EmailVerificationGuard";
import MainLayout from "@/components/Layout/MainLayout";
import { Layout } from "./components/Layout/Layout";

// Páginas
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterUser from "./pages/RegisterUser";
import RegisterOwner from "./pages/RegisterOwner";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Profile from './pages/Profile';
import Buildings from './pages/Buildings';
import Claims from "./pages/Claims";
import MyClaims from "./pages/MyClaims";
// import ClaimDetail from "./pages/ClaimDetail";
import Owners from "./pages/Owners";
import { OwnersManagement } from "./pages/OwnersManagement";
import BuildingSettings from "./pages/Settings/Building";
import Services from "./pages/Services";
import Spaces from "./pages/Spaces";
import OwnerUnit from "./pages/OwnerUnit";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ClaimsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rutas públicas */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/register-user" element={<RegisterUser />} />
                <Route path="/register/owner/:token" element={<RegisterOwner />} />
                <Route path="/owners/verify/:token" element={<RegisterOwner />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/verify-email" element={
                <ProtectedRoute>
                  <VerifyEmail />
                </ProtectedRoute>
              } />
              </Route>

              {/* Rutas protegidas */}
              <Route
                element={
                  <ProtectedRoute>
                    <EmailVerificationGuard>
                      <Outlet />
                    </EmailVerificationGuard>
                  </ProtectedRoute>
                }
              >
                {/* Ruta de perfil y configuración de WhatsApp (accesibles sin perfil completo) */}
                <Route path="profile" element={<Profile />} />
                <Route
                  path="settings/building"
                  element={
                    <Layout>
                      <BuildingSettings />
                    </Layout>
                  }
                />

                {/* Rutas que requieren perfil completo */}
                <Route
                  element={
                    <ProfileRequiredRoute>
                      <Layout>
                        <Outlet />
                      </Layout>
                    </ProfileRequiredRoute>
                  }
                >
                  {/* Rutas para usuarios normales */}
                  {/* Ruta claims solo para administradores */}
                  <Route path="claims" element={
                    <ProtectedRoute requiredRole="admin">
                      <Claims />
                    </ProtectedRoute>
                  } />
                  <Route path="my-claims" element={<MyClaims />} />
                  {/* <Route path="claims/:id" element={<ClaimDetail />} /> */}
                  <Route path="expenses" element={<h1 className="text-2xl font-bold">Expensas</h1>} />
                  <Route path="documents" element={<h1 className="text-2xl font-bold">Documentos</h1>} />
                  <Route path="bookings" element={<h1 className="text-2xl font-bold">Reservas</h1>} />
                  <Route path="owner-unit" element={<OwnerUnit />} />

                  {/* Rutas solo para administradores */}
                  <Route
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <Outlet />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="buildings" element={<Buildings />} />
                    <Route path="users" element={<h1 className="text-2xl font-bold">Usuarios</h1>} />
                    <Route path="settings" element={<h1 className="text-2xl font-bold">Configuración</h1>} />
                    <Route path="building/info" element={<h1 className="text-2xl font-bold">Información del Edificio</h1>} />
                    <Route path="building/units" element={<h1 className="text-2xl font-bold">Unidades</h1>} />
                    <Route path="building/residents" element={<h1 className="text-2xl font-bold">Residentes</h1>} />
                    <Route path="owners" element={<Owners />} />
                    <Route path="buildings/:buildingId/owners" element={<OwnersManagement />} />
                    <Route path="spaces" element={<Spaces />} />
                    {/* Ruta solo para SUPER_ADMIN */}
                    <Route path="services" element={<Services />} />
                  </Route>
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ClaimsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
