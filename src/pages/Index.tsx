import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Building, Users, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="space-y-24 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-12 py-12">
        <div className="flex-1 text-left space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            La solución definitiva para la Administración de Consorcios
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Optimiza tus tareas administrativas, mejora la comunicación con los propietarios y centraliza toda la información en un solo lugar.
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-spazios-green hover:bg-spazios-green-dark">
              <Link to="/register" className="flex items-center gap-2">
                Solicitar una demo gratuita
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex-1 relative">
          <img
            src="https://images.unsplash.com/photo-1496307653780-42ee777d4833"
            alt="Gestión de consorcios"
            className="w-full h-auto object-cover rounded-lg shadow-xl"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent pointer-events-none" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">¿Por qué elegir ConsorcioHub?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="border border-gray-200">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-spazios-green/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-spazios-green" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 -mx-4 px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Lo que dicen nuestros clientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author} className="bg-white">
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-4">{testimonial.content}</p>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="text-center py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">
            ¿Listo para transformar la gestión de tu consorcio?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Unite a los cientos de administradores que ya confían en nosotros
          </p>
          <Button size="lg" className="bg-spazios-green hover:bg-spazios-green-dark" asChild>
            <Link to="/register">Comenzar ahora</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

const features = [
  {
    title: "Gestión Centralizada",
    description: "Administra todos los aspectos de tus consorcios desde una única plataforma intuitiva y fácil de usar.",
    icon: Building
  },
  {
    title: "Comunicación Efectiva",
    description: "Mantén una comunicación fluida con propietarios y proveedores a través de nuestra plataforma.",
    icon: Users
  },
  {
    title: "Seguridad Garantizada",
    description: "Toda tu información está protegida y respaldada con los más altos estándares de seguridad.",
    icon: Lock
  }
];

const testimonials = [
  {
    content: "La plataforma ha revolucionado la forma en que administramos nuestros edificios.",
    author: "Carlos Rodríguez",
    role: "Administrador de Consorcios"
  },
  {
    content: "Excelente herramienta para mantener todo organizado y a los propietarios informados.",
    author: "María González",
    role: "Administradora"
  },
  {
    content: "La mejor decisión que tomamos para modernizar nuestra administración.",
    author: "Luis Martínez",
    role: "Propietario"
  }
];

export default Index;
