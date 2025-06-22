
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-spazios-green/10 to-spazios-green/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start py-12 gap-8">
          <div className="mb-4 md:mb-0 max-w-sm">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-spazios-green rounded-md p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-xl font-bold text-spazios-green">ConsorcioHub</span>
            </Link>
            <p className="mt-4 text-gray-600">
              Simplificando la gestión de tu edificio con tecnología inteligente y herramientas modernas.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
            <div>
              <h3 className="text-sm font-semibold text-spazios-green mb-4">Plataforma</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/features" className="text-gray-600 hover:text-spazios-green transition-colors">
                    Características
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-gray-600 hover:text-spazios-green transition-colors">
                    Precios
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-spazios-green mb-4">Recursos</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/help" className="text-gray-600 hover:text-spazios-green transition-colors">
                    Centro de Ayuda
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-600 hover:text-spazios-green transition-colors">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-spazios-green mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-gray-600 hover:text-spazios-green transition-colors">
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-600 hover:text-spazios-green transition-colors">
                    Términos
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 py-6">
          <p className="text-sm text-gray-600 text-center">
            © {new Date().getFullYear()} ConsorcioHub. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
