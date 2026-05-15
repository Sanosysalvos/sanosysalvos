"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Camera,
  Search,
  MapPin,
  Heart,
  Map,
  Mail,
  ShieldCheck,
  Globe,
  MessageCircle,
  Share2,
} from "lucide-react";

// Mantenemos los mockMascotas como respaldo por si el servidor falla
const mockMascotas = [
  {
    id: "1",
    nombre: "Max",
    tipo: "Perro",
    estado: "Perdido",
    ubicacion: "Santiago Centro",
    foto: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "2",
    nombre: "Luna",
    tipo: "Gato",
    estado: "Encontrado",
    ubicacion: "Providencia",
    foto: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "3",
    nombre: "Rocky",
    tipo: "Perro",
    estado: "Perdido",
    ubicacion: "Maipú",
    foto: "https://images.unsplash.com/photo-1537151608804-ea2f1fa73a74?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "4",
    nombre: "Milo",
    tipo: "Gato",
    estado: "Perdido",
    ubicacion: "La Florida",
    foto: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=800&q=80",
  },
];

export default function HomePage() {
  // --- NUEVA LÓGICA DE CARGA ---
  const [mascotas, setMascotas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Intentamos traer datos reales del BFF
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${baseUrl}/api/explorar`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Error en servidor");

        const datos = await res.json();
        // Si hay datos en la DB los usamos, si no, usamos los mocks para que no se vea vacío
        setMascotas(datos.length > 0 ? datos : mockMascotas);
      } catch (error) {
        console.error("Usando mocks por fallo de conexión");
        setMascotas(mockMascotas);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  // Mientras carga, mostramos un estado simple para no romper el diseño
  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  // -----------------------------

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* --- SECCIÓN DE BIENVENIDA (HERO) --- */}
      <section className="bg-indigo-600 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">
            Ayudemos a que vuelvan a casa
          </h1>
          <p className="text-lg sm:text-xl text-indigo-100 mb-8">
            Revisa los reportes recientes de mascotas perdidas y encontradas en
            tu comunidad.
          </p>
        </div>
      </section>

      {/* --- SECCIÓN DE TARJETAS (GRILLA DINÁMICA) --- */}
      <section className="max-w-7xl mx-auto px-4 py-12 w-full flex-grow">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">
          Reportes Recientes
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* USAMOS 'mascotas' (del servidor) EN LUGAR DE 'mockMascotas' */}
          {mascotas.map((mascota) => (
            <Link
              key={mascota.id}
              href={`/mascota/${mascota.id}`}
              className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col"
            >
              <div className="relative h-56 w-full bg-slate-200 overflow-hidden">
                <img
                  src={mascota.foto || "https://via.placeholder.com/400"}
                  alt={`Foto de ${mascota.nombre}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* BADGES CON LOS 3 COLORES DINÁMICOS */}
                <div
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm text-white ${
                    mascota.estado?.toUpperCase() === "PERDIDO"
                      ? "bg-rose-500/90"
                      : ["RECUPERADO", "RETIRADO", "ENCONTRADO"].includes(
                            mascota.estado?.toUpperCase(),
                          )
                        ? "bg-emerald-500/90"
                        : "bg-sky-500/90"
                  }`}
                >
                  {mascota.estado}
                </div>
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-slate-800 line-clamp-1">
                    {mascota.nombre}
                  </h3>
                  <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded-md">
                    {(mascota.tipo || mascota.especie)?.toUpperCase()}
                  </span>
                </div>

                <p className="text-slate-500 text-sm flex items-center mt-1">
                  <MapPin size={14} className="mr-1.5 text-indigo-500" />
                  {mascota.ubicacion || mascota.direccionFormateada}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-indigo-600 font-semibold text-sm group-hover:text-indigo-700">
                  Ver detalles completos
                  <span className="transform group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* --- FOOTER (Pie de Página) --- */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
                <Heart className="fill-indigo-500 text-indigo-500" /> Sanos y
                Salvos
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Plataforma dedicada a la protección y reencuentro de mascotas
                perdidas. Construyendo una comunidad más segura para nuestros
                mejores amigos.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Plataforma</h4>
              <ul className="space-y-4 text-sm">
                <li>
                  <Link
                    href="/explorar"
                    className="hover:text-white transition-colors"
                  >
                    Explorar mascotas
                  </Link>
                </li>
                <li>
                  <Link
                    href="/reportar"
                    className="hover:text-white transition-colors"
                  >
                    Reportar caso
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Consejos de seguridad
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Ayuda</h4>
              <ul className="space-y-4 text-sm">
                <li>
                  <Link
                    href="/faq"
                    className="hover:text-white transition-colors"
                  >
                    Preguntas frecuentes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contacto"
                    className="hover:text-white transition-colors"
                  >
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacidad"
                    className="hover:text-white transition-colors"
                  >
                    Privacidad
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Comunidad</h4>
              <div className="flex gap-4 mb-6">
                <a
                  href="#"
                  className="bg-slate-800 p-3 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                >
                  <Globe size={20} />
                </a>
                <a
                  href="#"
                  className="bg-slate-800 p-3 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                >
                  <MessageCircle size={20} />
                </a>
                <a
                  href="#"
                  className="bg-slate-800 p-3 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                >
                  <Share2 size={20} />
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Mail size={16} />
                hola@sanosysalvos.cl
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Sanos y Salvos. Todos los derechos
              reservados.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
              <ShieldCheck size={14} />
              Servidor Seguro
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
