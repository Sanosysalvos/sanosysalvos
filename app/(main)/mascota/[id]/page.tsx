'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
// Importamos todos los íconos necesarios, incluyendo Heart para que no de error
import { 
  ArrowLeft, MapPin, Calendar, PawPrint, Info, 
  Share2, MessageCircle, AlertTriangle, CheckCircle, Heart 
} from 'lucide-react';

export default function DetalleMascota() {
  const { id } = useParams();
  const router = useRouter();
  const [mascota, setMascota] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDetalle = async () => {
      try {
        // Usamos 127.0.0.1 para asegurar la conexión en Windows
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';
        const res = await fetch(`${baseUrl}/api/explorar`, { cache: 'no-store' });
        
        if (!res.ok) throw new Error("Error en servidor");
        
        const datos = await res.json();
        // Buscamos la mascota comparando los IDs como Strings para evitar errores
        const encontrada = datos.find((m: any) => String(m.id) === String(id));
        setMascota(encontrada);
      } catch (error) {
        console.error("Error al cargar el detalle");
      } finally {
        setCargando(false);
      }
    };

    if (id) cargarDetalle();
  }, [id]);

  if (cargando) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">

      {/* CONTENIDO DEL DETALLE */}
      {!mascota ? (
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold text-slate-800">La mascota ya no existe</h1>
          <p className="text-slate-500 mb-4">Es posible que el reporte haya sido eliminado.</p>
          <Link href="/" className="text-indigo-600 font-bold underline">Volver al inicio</Link>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 py-10 w-full">
          {/* Botón sutil para volver atrás debajo del header */}
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors font-medium"
          >
            <ArrowLeft size={18} /> Volver a la lista
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Foto principal */}
            <div className="relative h-[500px] rounded-[32px] overflow-hidden shadow-2xl border-4 border-white">
              <img 
                src={mascota.foto || 'https://via.placeholder.com/800'} 
                className="w-full h-full object-cover"
                alt={mascota.nombre}
              />
              <div className={`absolute top-6 right-6 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${
                mascota.estado === 'Perdido' ? 'bg-red-600 text-white' : 'bg-emerald-500 text-white'
              }`}>
                {mascota.estado}
              </div>
            </div>

            {/* Información básica */}
            <div className="flex flex-col">
              <h1 className="text-5xl font-black text-slate-900 mb-2 uppercase italic tracking-tighter">
                {mascota.nombre}
              </h1>
              <span className="text-indigo-600 font-bold bg-indigo-50 px-4 py-1 rounded-full w-fit mb-8">
                {mascota.tipo || 'Mascota'}
              </span>

              <div className="space-y-6">
                <div className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                  <div className="bg-red-50 p-3 rounded-xl text-red-500"><MapPin /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Ubicación</p>
                    <p className="text-lg font-semibold text-slate-800">{mascota.direccionFormateada}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Info size={18} className="text-indigo-600" /> Descripción
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {mascota.descripcion || `Ayúdanos a encontrar a ${mascota.nombre}. Fue visto por última vez en ${mascota.ubicacion}.`}
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button className="flex-grow bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs">
                    Contactar dueño
                  </button>
                  <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-red-500 transition-all shadow-sm">
                    <Heart size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}