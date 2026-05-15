"use client";
import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Info,
  Heart,
  Send,
  X,
} from "lucide-react";

export default function DetalleMascota() {
  const { id } = useParams();
  const router = useRouter();
  const [mascota, setMascota] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  // --- NUEVOS ESTADOS PARA EL MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const cargarDetalle = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${baseUrl}/api/explorar`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Error en servidor");
        const datos = await res.json();
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

  // --- FUNCIÓN PARA ENVIAR AL BFF ---
  const handleEnviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/api/notificar-avistamiento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: id,
          mensaje: mensaje,
        }),
      });

      if (response.ok) {
        // --- USANDO TU TOAST EXISTENTE ---
        toast.success("¡Aviso enviado!", {
          description: `El dueño de ${mascota?.nombre} recibirá tu mensaje por correo.`,
        });

        setIsModalOpen(false);
        setMensaje("");
      } else {
        toast.error("Error al enviar", {
          description: "No pudimos contactar al dueño, intenta más tarde.",
        });
      }
    } catch (error) {
      toast.error("Error de conexión", {
        description: "Revisa tu conexión a internet e intenta de nuevo.",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col relative">
      {!mascota ? (
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold text-slate-800">
            La mascota ya no existe
          </h1>
          <Link href="/" className="text-indigo-600 font-bold underline">
            Volver al inicio
          </Link>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 py-10 w-full">
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
                src={mascota.foto || "https://via.placeholder.com/800"}
                className="w-full h-full object-cover"
                alt={mascota.nombre}
              />
              <div
                className={`absolute top-6 right-6 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-xl backdrop-blur-md ${
                  mascota.estado?.toUpperCase() === "PERDIDO"
                    ? "bg-rose-600"
                    : "bg-emerald-500"
                }`}
              >
                {mascota.estado}
              </div>
            </div>

            {/* Info y Acción */}
            <div className="flex flex-col">
              <h1 className="text-5xl font-black text-slate-900 mb-2 uppercase italic tracking-tighter">
                {mascota.nombre}
              </h1>
              <span className="text-indigo-600 font-bold bg-indigo-50 px-4 py-1 rounded-full w-fit mb-8">
                {mascota.tipo || "Mascota"}
              </span>

              <div className="space-y-6">
                {/* Tarjetas de Info (Ubicación, Fecha, Descripción igual que antes) */}
                <div className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                  <div className="bg-red-50 p-3 rounded-xl text-red-500">
                    <MapPin />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">
                      Ubicación
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {mascota.direccionFormateada ||
                        mascota.ubicacion ||
                        "Maipú"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                  <div className="bg-amber-50 p-3 rounded-xl text-amber-500">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">
                      Fecha de Pérdida
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {mascota.fechaPerdida
                        ? new Date(mascota.fechaPerdida).toLocaleDateString(
                            "es-CL",
                            { day: "numeric", month: "long", year: "numeric" },
                          )
                        : "Fecha no especificada"}
                    </p>
                  </div>
                </div>

                {/* BOTÓN CONTACTAR DUEÑO (Abre el modal) */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex-grow bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs"
                  >
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

      {/* --- MODAL DE CONTACTO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900 uppercase italic">
                  Contactar Dueño
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>

              <p className="text-slate-500 mb-6 text-sm">
                Envía un mensaje directo al dueño de{" "}
                <strong>{mascota?.nombre}</strong>. Se le notificará por correo
                electrónico de inmediato.
              </p>

              <form onSubmit={handleEnviarMensaje}>
                <textarea
                  required
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Ej: Lo acabo de ver en la plaza Maipú, llevaba un collar azul..."
                  className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-6 focus:ring-2 focus:ring-indigo-600 focus:outline-none text-slate-700 resize-none"
                />

                <button
                  type="submit"
                  disabled={enviando}
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all ${
                    enviando
                      ? "bg-slate-200 text-slate-400"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                  }`}
                >
                  {enviando ? (
                    "Enviando..."
                  ) : (
                    <>
                      {" "}
                      <Send size={16} /> Enviar Aviso{" "}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
