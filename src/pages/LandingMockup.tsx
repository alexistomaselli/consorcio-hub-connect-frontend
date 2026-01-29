import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Building2,
  ShieldCheck,
  FileText,
  Users,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Mail,
  Phone,
  Calendar,
  Gavel,
  History,
  FileCheck,
  Vote
} from 'lucide-react';

import { Link } from 'react-router-dom';

export default function LandingMockup() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  const features = [
    {
      icon: <MessageCircle className="w-10 h-10 text-whatsapp" />,
      title: "Gestión por WhatsApp",
      description: "Tus consorcistas ya usan WhatsApp. Ahora pueden gestionar reclamos, consultar expensas y recibir notificaciones en su app favorita."
    },
    {
      icon: <FileText className="w-10 h-10 text-primary" />,
      title: "Documentación Centralizada",
      description: "Acceso inmediato a actas de asamblea, reglamentos y comprobantes de pago. Transparencia total en un solo lugar."
    },
    {
      icon: <LayoutDashboard className="w-10 h-10 text-primary" />,
      title: "Dashboard para Administradores",
      description: "Controla múltiples consorcios desde un panel unificado. Estado de reclamos, alertas y métricas en tiempo real."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-primary/20">

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
              <Building2 size={24} />
            </div>
            <span className="text-xl font-bold text-slate-800">ConsorcioHub</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-slate-600 hover:text-primary transition-colors">Home</Link>
            <button onClick={() => scrollTo('features')} className="text-slate-600 hover:text-primary transition-colors">Características</button>
            <button onClick={() => scrollTo('how-it-works')} className="text-slate-600 hover:text-primary transition-colors">Cómo funciona</button>
            <button onClick={() => scrollTo('contact')} className="px-5 py-2.5 bg-primary text-white font-medium rounded-full hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
              Solicitar Demo
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-slate-800" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-4">
                <button onClick={() => scrollTo('features')} className="text-left text-slate-600 py-2">Características</button>
                <button onClick={() => scrollTo('how-it-works')} className="text-left text-slate-600 py-2">Cómo funciona</button>
                <button onClick={() => scrollTo('contact')} className="w-full px-5 py-3 bg-primary text-white font-medium rounded-lg text-center">
                  Solicitar Demo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div
              className="lg:w-1/2 space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-primary text-sm font-medium border border-blue-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                La plataforma #1 para administradores modernos
              </div>

              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Gestión de Consorcios <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                  Simplificada y en WhatsApp
                </span>
              </h1>

              <p className="text-xl text-slate-600 max-w-lg leading-relaxed">
                Olvídate de los emails perdidos. Centraliza reclamos, documentos y comunicaciones en una plataforma que conecta directamente con el WhatsApp de tus vecinos.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => scrollTo('contact')} className="px-8 py-4 bg-primary text-white text-lg font-semibold rounded-full hover:bg-primary-dark transition-all transform hover:-translate-y-1 shadow-xl shadow-primary/30 flex items-center justify-center gap-2">
                  Empezar ahora <ArrowRight size={20} />
                </button>
                <button className="px-8 py-4 bg-white text-slate-700 border border-slate-200 text-lg font-semibold rounded-full hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                  <Users size={20} /> Soy Propietario
                </button>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-500 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                      U{i}
                    </div>
                  ))}
                </div>
                <p>Confían en nosotros +500 administradores</p>
              </div>
            </motion.div>

            <motion.div
              className="lg:w-1/2 relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative z-10 mx-auto w-[300px] h-[600px] bg-slate-900 rounded-[3rem] border-8 border-slate-900 shadow-2xl overflow-hidden">
                {/* Mockup Screen Content */}
                <div className="h-full w-full bg-white flex flex-col">
                  {/* Header */}
                  <div className="bg-[#075E54] h-20 flex items-end p-4 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <Building2 size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">ConsorcioHub Bot</p>
                        <p className="text-[10px] opacity-80">En línea</p>
                      </div>
                    </div>
                  </div>
                  {/* Chat */}
                  <div className="flex-1 bg-[#efe7dd] p-4 flex flex-col gap-4 overflow-hidden relative">
                    <div className="bg-white p-3 rounded-lg rounded-tl-none self-start max-w-[80%] shadow-sm text-sm">
                      Hola 👋 Soy el asistente de tu edificio. ¿En qué puedo ayudarte hoy?
                      <div className="text-[10px] text-gray-400 text-right mt-1">10:00</div>
                    </div>
                    <div className="bg-[#dcf8c6] p-3 rounded-lg rounded-tr-none self-end max-w-[80%] shadow-sm text-sm">
                      Quiero reportar una luz quemada en el pasillo del 3er piso
                      <div className="text-[10px] text-gray-400 text-right mt-1">10:02</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg rounded-tl-none self-start max-w-[80%] shadow-sm text-sm">
                      Entendido. He creado el reclamo #482. 🛠️
                      <br />
                      Te notificaré cuando el encargado lo resuelva.
                      <div className="mt-2 border-t pt-2">
                        <button className="w-full text-center text-primary text-xs font-semibold">Ver estado</button>
                      </div>
                      <div className="text-[10px] text-gray-400 text-right mt-1">10:02</div>
                    </div>
                  </div>
                  {/* Input area */}
                  <div className="h-14 bg-white border-t flex items-center px-4 gap-2">
                    <div className="w-full h-8 bg-slate-100 rounded-full"></div>
                    <div className="w-8 h-8 bg-[#075E54] rounded-full flex items-center justify-center">
                      <ArrowRight size={16} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Web Card Mockup behind */}
              <motion.div
                className="absolute -right-12 top-20 w-[400px] h-[300px] bg-white rounded-xl shadow-2xl border border-slate-100 p-4 hidden md:block"
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex gap-4 mb-4">
                  <div className="w-1/4 h-20 bg-blue-50 rounded-lg animate-pulse"></div>
                  <div className="w-1/4 h-20 bg-green-50 rounded-lg animate-pulse"></div>
                  <div className="w-1/4 h-20 bg-orange-50 rounded-lg animate-pulse"></div>
                  <div className="w-1/4 h-20 bg-purple-50 rounded-lg animate-pulse"></div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-slate-100 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="w-3/4 h-2 bg-slate-200 rounded"></div>
                        <div className="w-1/2 h-2 bg-slate-100 rounded"></div>
                      </div>
                      <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Resuelto</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white -mt-16 relative z-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Building2 className="w-10 h-10 text-primary" />, value: "500+", label: "Edificios Activos" },
              { icon: <Users className="w-10 h-10 text-primary" />, value: "10k+", label: "Usuarios Felices" },
              { icon: <CheckCircle2 className="w-10 h-10 text-primary" />, value: "25+", label: "Ciudades" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center gap-2 p-8 rounded-2xl border border-slate-100 bg-white shadow-lg shadow-slate-200/50"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                {stat.icon}
                <p className="text-4xl font-black text-slate-900">{stat.value}</p>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badge Section */}
      <section className="py-10 border-y border-slate-100 bg-slate-50/50">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">Simplifica la vida en comunidad</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Logos placeholder using text for now */}
            <h3 className="text-xl font-bold flex items-center gap-2"><Smartphone className="text-slate-400" /> Mobile First</h3>
            <h3 className="text-xl font-bold flex items-center gap-2"><ShieldCheck className="text-slate-400" /> Secure Data</h3>
            <h3 className="text-xl font-bold flex items-center gap-2"><Users className="text-slate-400" /> Multi-User</h3>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Todo lo que necesitas para gestionar tu edificio</h2>
            <p className="text-lg text-slate-600">Herramientas potentes para el administrador y una experiencia simple para el vecino.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="p-8 rounded-2xl bg-white border border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all group"
                {...fadeInUp}
                transition={{ delay: i * 0.1 }}
              >
                <div className="mb-6 p-4 bg-slate-50 rounded-2xl w-fit group-hover:bg-primary/5 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Features Grid */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeInUp}>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                Acceso a información crítica <br />
                <span className="text-primary">al instante</span>
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Ya no hace falta enviar el mismo PDF 50 veces. Con ConsorcioHub, toda la documentación del edificio está organizada y segura.
              </p>

              <div className="space-y-6">
                {[
                  { title: "Actas de Asamblea", desc: "Historial completo disponible para todos los propietarios." },
                  { title: "Reglamentos Internos", desc: "Normas de convivencia siempre a mano." },
                  { title: "Estado de Cuenta", desc: "Transparencia total en los gastos del consorcio." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1">
                      <CheckCircle2 className="text-primary w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{item.title}</h4>
                      <p className="text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-lg">Documentos Recientes</h3>
                <button className="text-primary text-sm font-medium">Ver todo</button>
              </div>
              <div className="space-y-4">
                {[
                  { name: "Acta Asamblea Ordinaria 2024.pdf", date: "12 Mar 2024", type: "PDF" },
                  { name: "Reglamento_Cocheras_V2.pdf", date: "05 Feb 2024", type: "PDF" },
                  { name: "Comprobantes_Reparacion_Ascensor.zip", date: "28 Ene 2024", type: "ZIP" },
                  { name: "Expensas_Enero_2025.pdf", date: "10 Ene 2025", type: "PDF" },
                ].map((doc, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-blue-50 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border text-slate-500 group-hover:text-primary group-hover:border-primary/30">
                      <FileText size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 truncate">{doc.name}</p>
                      <p className="text-xs text-slate-500">{doc.date} • {doc.type}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight size={16} className="text-primary" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Governance Section */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <motion.div
              className="order-2 lg:order-1"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mb-2">Finalizada</span>
                    <h4 className="text-xl font-bold text-slate-900">Asamblea Ordinaria Anual</h4>
                    <div className="flex items-center gap-2 mt-2 text-slate-500 text-sm">
                      <Calendar size={16} />
                      <span>15 Oct, 2024 • 19:30hs</span>
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <History className="text-slate-400" size={24} />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Orden del día</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-xs font-bold text-primary">1.</span>
                        <span className="text-sm font-medium text-slate-700">Aprobación de Balance Anual</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-xs font-bold text-primary">2.</span>
                        <span className="text-sm font-medium text-slate-700">Renovación de fachada principal</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Resultados Votación Pto. 2</p>
                    <div className="flex gap-1 h-3 rounded-full overflow-hidden mb-3">
                      <div className="w-[75%] bg-primary"></div>
                      <div className="w-[20%] bg-slate-300"></div>
                      <div className="w-[5%] bg-slate-100"></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-600">
                      <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span> A FAVOR (75%)</div>
                      <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300"></span> EN CONTRA (20%)</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button className="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                      <FileText size={16} />
                      Ver Acta Generada
                    </button>
                    <div className="flex items-center gap-2 text-slate-400">
                      <ShieldCheck size={16} />
                      <span className="text-xs font-medium">Reglamento v2.4</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="order-1 lg:order-2 space-y-8"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                Asambleas con trazabilidad legal y decisiones claras
              </h2>
              <p className="text-lg text-slate-600">
                Convocá, votá y documentá acuerdos en un solo flujo, con actas disponibles y reglamentos siempre actualizados.
              </p>

              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                {[
                  { icon: <FileText />, text: "Convocatorias y orden del día centralizados" },
                  { icon: <Vote />, text: "Votaciones registradas con evidencia" },
                  { icon: <FileCheck />, text: "Actas automáticas y archivo seguro" },
                  { icon: <Gavel />, text: "Reglamentos y resoluciones siempre accesibles" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="p-2 bg-white border border-slate-200 shadow-sm rounded-lg text-primary shrink-0">
                      {React.cloneElement(item.icon as React.ReactElement, { size: 20 } as any)}
                    </div>
                    <p className="text-sm font-semibold text-slate-700 pt-1">{item.text}</p>
                  </div>
                ))}
              </div>

              <button className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
                Solicitar demo de gobernanza
              </button>
            </motion.div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="bg-primary rounded-[3rem] p-12 lg:p-24 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-4xl lg:text-5xl font-bold">Lleva tu consorcio al siguiente nivel</h2>
              <p className="text-primary-light text-xl">Únete a los administradores que están modernizando la gestión de sus edificios hoy mismo.</p>
              <button
                onClick={() => scrollTo('contact')}
                className="px-10 py-5 bg-white text-primary text-lg font-bold rounded-full hover:bg-slate-100 transition-all shadow-xl"
              >
                Solicitar demostración gratuita
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Planes a medida</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Escalamos con vos, desde un solo edificio hasta grandes administraciones con cientos de unidades.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Basic Plan */}
            <div className="flex flex-col gap-8 rounded-2xl border border-slate-100 bg-slate-50 p-8 hover:shadow-lg transition-shadow">
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-slate-900">Básico</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">$0</span>
                  <span className="text-sm font-bold text-slate-500 opacity-60">/mes</span>
                </div>
                <p className="text-sm text-slate-500">Ideal para consorcios pequeños autogestionados.</p>
              </div>
              <button className="w-full py-3 px-4 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors">
                Comenzar Gratis
              </button>
              <ul className="flex flex-col gap-4">
                {[
                  "Gestión de 1 edificio",
                  "Expensas digitales básicas",
                  "Soporte por email"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Admin Plan */}
            <div className="flex flex-col gap-8 rounded-2xl border-2 border-primary bg-white p-8 shadow-xl relative scale-105 z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                Más Popular
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-slate-900">Administrador</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">$49</span>
                  <span className="text-sm font-bold text-slate-500 opacity-60">/mes</span>
                </div>
                <p className="text-sm text-slate-500">Para profesionales con múltiples edificios.</p>
              </div>
              <button className="w-full py-3 px-4 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
                Prueba Gratis 14 Días
              </button>
              <ul className="flex flex-col gap-4">
                {[
                  "Gestión de hasta 5 edificios",
                  "Cobranza automática con QR",
                  "Reportes financieros avanzados",
                  "Votaciones online"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Premium Plan */}
            <div className="flex flex-col gap-8 rounded-2xl border border-slate-100 bg-slate-50 p-8 hover:shadow-lg transition-shadow">
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-slate-900">Premium</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-primary">$99</span>
                  <span className="text-sm font-bold text-slate-500 opacity-60">/mes</span>
                </div>
                <p className="text-sm text-slate-500">Control total para grandes empresas.</p>
              </div>
              <button className="w-full py-3 px-4 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors">
                Contactar Ventas
              </button>
              <ul className="flex flex-col gap-4">
                {[
                  "Edificios ilimitados",
                  "App móvil personalizada",
                  "Soporte 24/7 Priority"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-xl mx-auto bg-white p-8 lg:p-12 rounded-3xl shadow-xl border border-slate-100">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Hablemos</h2>
              <p className="text-slate-600">Déjanos tus datos y te contactaremos a la brevedad.</p>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nombre completo</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Juan Pérez" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email corporativo</label>
                <input type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="juan@administracion.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cantidad de edificios administrados</label>
                <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white">
                  <option>1 - 5</option>
                  <option>5 - 20</option>
                  <option>+20</option>
                </select>
              </div>
              <button className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl">
                Enviar mensaje
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4 text-white">
                <Building2 size={24} />
                <span className="text-xl font-bold">ConsorcioHub</span>
              </div>
              <p className="max-w-xs">La plataforma integral para la administración inteligente de consorcios y edificios.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Para Propietarios</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Mail size={16} /> hola@consorciohub.com</li>
                <li className="flex items-center gap-2"><Phone size={16} /> +54 11 1234 5678</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-sm">
            © 2024 ConsorcioHub Connect. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div >
  );
}

// Icon component needed for the layout logic above
function LayoutDashboard({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  )
}
