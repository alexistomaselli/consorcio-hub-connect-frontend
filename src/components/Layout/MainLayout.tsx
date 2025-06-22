
import React from 'react';
import { Outlet } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Banner superior */}
      <div className="bg-spazios-green text-white text-center py-2 px-4">
        <div className="container mx-auto">
          <p className="text-sm font-medium">
            ¡Conozca nuestro sistema de gestión de edificios!
            <a href="/register" className="ml-2 underline hover:no-underline">
              Agenda una demo
            </a>
          </p>
        </div>
      </div>
      
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>

      <Footer />

      {/* Botón flotante de WhatsApp */}
      <a
        href="https://wa.me/1234567890"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#128C7E] transition-colors z-50"
        aria-label="Contactar por WhatsApp"
      >
        <MessageSquare size={24} />
      </a>
    </div>
  );
};

export default MainLayout;
