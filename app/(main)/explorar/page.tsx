"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, Filter } from "lucide-react";

// Mocks de respaldo por si el servidor no tiene datos aún
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
];

export default function ExplorarPage() {
  const [mascotas, setMascotas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados de filtros
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;

        const res = await fetch(`${baseUrl}/api/explorar`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Error en servidor");

        const datos = await res.json();
        setMascotas(datos.length > 0 ? datos : mockMascotas);
      } catch (error) {
        console.error("Fallo de conexión, cargando mocks...");
        setMascotas(mockMascotas);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  // Lógica de filtrado LOCAL corregida con Avistado
  const mascotasFiltradas = mascotas.filter((mascota) => {
    const especieReal = mascota.especie || mascota.tipo || "Otro";
    const estadoDB = mascota.estado ? mascota.estado.toUpperCase() : "";

    let coincideEstado = false;

    if (filtroEstado === "Todos") {
      coincideEstado = true;
    } else if (filtroEstado === "Perdido") {
      coincideEstado = estadoDB === "PERDIDO";
    } else if (filtroEstado === "Encontrado") {
      coincideEstado = ["RECUPERADO", "RETIRADO", "ENCONTRADO"].includes(
        estadoDB,
      );
    } else if (filtroEstado === "Avistado") {
      coincideEstado = estadoDB === "AVISTADO";
    }

    const coincideTipo =
      filtroTipo === "Todos" ||
      especieReal.toLowerCase() === filtroTipo.toLowerCase();

    return coincideTipo && coincideEstado;
  });

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* SECCIÓN DE FILTROS */}
      <section className="bg-white border-b py-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Search className="text-indigo-600" /> Explorar Reportes
              </h1>
              <p className="text-slate-500 mt-1 font-medium">
                Filtra entre {mascotas.length} mascotas encontradas, perdidas y
                avistadas
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              {/* Filtro por Especie */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  ¿Qué buscas?
                </span>
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  {["Todos", "Perro", "Gato"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setFiltroTipo(t)}
                      className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                        filtroTipo === t
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro por Estado */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Estado del reporte
                </span>
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  {["Todos", "Perdido", "Encontrado", "Avistado"].map((e) => (
                    <button
                      key={e}
                      onClick={() => setFiltroEstado(e)}
                      className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                        filtroEstado === e
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESULTADOS */}
      <section className="max-w-7xl mx-auto px-4 py-12 w-full">
        {mascotasFiltradas.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <Filter className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-bold text-lg">
              No hay resultados para esta combinación
            </p>
            <button
              onClick={() => {
                setFiltroTipo("Todos");
                setFiltroEstado("Todos");
              }}
              className="text-indigo-600 font-black mt-2 underline"
            >
              Ver todas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {mascotasFiltradas.map((mascota) => (
              <Link
                key={mascota.id}
                href={`/mascota/${mascota.id}`}
                className="group bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col"
              >
                <div className="relative h-60 w-full">
                  <img
                    src={mascota.foto || "https://via.placeholder.com/400"}
                    alt={mascota.nombre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* BADGES DINÁMICOS */}
                  <div
                    className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md text-white ${
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

                <div className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">
                      {mascota.nombre}
                    </h3>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                      {(mascota.tipo || mascota.especie)?.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center text-slate-500 text-sm font-medium mb-4">
                    <MapPin size={14} className="mr-1.5 text-indigo-500" />
                    {mascota.ubicacion || mascota.direccionFormateada}
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-indigo-600 font-black text-sm">
                    Ver Detalles
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
