"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CldUploadWidget } from "next-cloudinary";
import {
  ArrowLeft,
  UploadCloud,
  MapPin,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/app/(main)/components/mapComponent/page"), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] bg-slate-100 rounded-[1.25rem] animate-pulse flex items-center justify-center text-slate-400 text-sm">
      Cargando mapa...
    </div>
  ),
});

const ESPECIES = ["Perro", "Gato", "Ave", "Otro"];

export default function AvistarPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [coordenadas, setCoordenadas] = useState<{ lat: number; lng: number } | null>(null);
  const [especie, setEspecie] = useState("");
  const [color, setColor] = useState("");
  const [comentario, setComentario] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [mascotasPerdidas, setMascotasPerdidas] = useState<any[]>([]);
  const [cargandoMascotas, setCargandoMascotas] = useState(false);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState<any | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState("");
  const [centroMapa] = useState({ lat: -33.4489, lng: -70.6693 });

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  useEffect(() => {
    if (!especie) {
      setMascotasPerdidas([]);
      setMascotaSeleccionada(null);
      return;
    }
    const cargar = async () => {
      setCargandoMascotas(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/explorar`);
        if (!res.ok) throw new Error();
        const datos: any[] = await res.json();
        const filtradas = datos.filter(
          (m) =>
            m.estado?.toUpperCase() === "PERDIDO" &&
            m.especie?.toLowerCase() === especie.toLowerCase()
        );
        setMascotasPerdidas(filtradas);
      } catch {
        setMascotasPerdidas([]);
      } finally {
        setCargandoMascotas(false);
      }
    };
    cargar();
  }, [especie]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setCoordenadas({ lat, lng });
  }, []);

  const mascotasFiltradas = mascotasPerdidas.filter((m) =>
    m.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!coordenadas) {
      setError("Debes marcar la ubicación del avistamiento en el mapa.");
      return;
    }
    if (!fotoUrl) {
      setError("Debes subir una foto del animal avistado.");
      return;
    }
    if (!especie) {
      setError("Selecciona la especie del animal.");
      return;
    }

    setEnviando(true);

    const payload: Record<string, any> = {
      reporterUid: user!.uid,
      latitud: coordenadas.lat,
      longitud: coordenadas.lng,
      especie: especie.toUpperCase(),
      color: color || "No especificado",
      comentario,
      fotoUrl,
    };

    if (mascotaSeleccionada) {
      payload.petId = mascotaSeleccionada.id;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/avistar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setExito(true);
      setTimeout(() => router.push("/explorar"), 2500);
    } catch {
      setError("No se pudo registrar el avistamiento. Intenta nuevamente.");
    } finally {
      setEnviando(false);
    }
  };

  if (!user) return null;

  if (exito) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] p-10 text-center max-w-sm shadow-xl border border-slate-100">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={44} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">¡Avistamiento registrado!</h2>
          <p className="text-slate-500 text-sm">
            Gracias por ayudar. El motor de coincidencias procesará tu reporte automáticamente.
          </p>
          <p className="text-xs text-slate-400 mt-4">Redirigiendo a explorar...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/explorar"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium mb-4"
          >
            <ArrowLeft size={16} /> Volver a explorar
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Reportar Avistamiento
          </h1>
          <p className="text-slate-500 mt-1">
            Marca en el mapa dónde viste al animal y completa los detalles.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* MAPA */}
            <div className="space-y-4">
              <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h2 className="font-bold text-slate-800 flex items-center gap-2">
                    <MapPin size={18} className="text-indigo-500" />
                    Marca la ubicación del avistamiento
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Haz click en el mapa para fijar el punto exacto
                  </p>
                </div>
                <div className="p-4">
                  <MapComponent
                    centerLat={centroMapa.lat}
                    centerLng={centroMapa.lng}
                    interactive
                    onMapClick={handleMapClick}
                    height="380px"
                  />
                </div>
                {coordenadas ? (
                  <div className="px-5 pb-4 flex items-center gap-2 text-emerald-600 text-xs font-bold">
                    <CheckCircle2 size={14} />
                    Ubicación marcada: {coordenadas.lat.toFixed(5)}, {coordenadas.lng.toFixed(5)}
                  </div>
                ) : (
                  <div className="px-5 pb-4 flex items-center gap-2 text-slate-400 text-xs">
                    <AlertCircle size={14} />
                    Aún no has marcado ningún punto
                  </div>
                )}
              </div>
            </div>

            {/* FORMULARIO */}
            <div className="space-y-5">
              {/* Foto */}
              <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-5">
                <h2 className="font-bold text-slate-800 mb-3">Foto del animal</h2>
                <CldUploadWidget
                  uploadPreset="mascotas_preset"
                  onSuccess={(results: any) => setFotoUrl(results.info.secure_url)}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      className={`w-full flex flex-col items-center justify-center py-7 border-2 border-dashed rounded-2xl transition-all ${
                        fotoUrl
                          ? "border-emerald-400 bg-emerald-50"
                          : "border-slate-300 hover:border-indigo-400 bg-slate-50"
                      }`}
                    >
                      {fotoUrl ? (
                        <img
                          src={fotoUrl}
                          alt="Foto subida"
                          className="h-24 w-24 object-cover rounded-xl mb-2 shadow"
                        />
                      ) : (
                        <UploadCloud size={36} className="text-slate-400 mb-2" />
                      )}
                      <span className="text-sm font-medium text-slate-500">
                        {fotoUrl ? "Cambiar foto" : "Subir foto"}
                      </span>
                    </button>
                  )}
                </CldUploadWidget>
              </div>

              {/* Descripción */}
              <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-5 space-y-4">
                <h2 className="font-bold text-slate-800">Descripción del animal</h2>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                    Especie
                  </label>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {ESPECIES.map((esp) => (
                      <button
                        key={esp}
                        type="button"
                        onClick={() => {
                          setEspecie(esp);
                          setMascotaSeleccionada(null);
                          setBusqueda("");
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          especie === esp
                            ? "bg-indigo-600 text-white border-indigo-600 shadow"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300"
                        }`}
                      >
                        {esp}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                    Color principal
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: negro con manchas blancas"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                    Comentario adicional
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ej: Llevaba collar rojo, parecía asustado cerca de la plaza..."
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Selector de mascota */}
              {especie && (
                <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-5">
                  <h2 className="font-bold text-slate-800 mb-1">
                    ¿Reconoces a esta mascota?{" "}
                    <span className="text-slate-400 font-normal text-sm">(opcional)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mb-3">
                    Selecciona si identificas al animal entre los{" "}
                    <strong>{especie.toLowerCase()}s</strong> perdidos
                  </p>

                  <div className="relative mb-3">
                    <Search size={14} className="absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                    />
                  </div>

                  {cargandoMascotas && (
                    <div className="flex items-center gap-2 text-slate-400 text-sm py-4 justify-center">
                      <Loader2 size={16} className="animate-spin" />
                      Buscando mascotas perdidas...
                    </div>
                  )}

                  {!cargandoMascotas && mascotasFiltradas.length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-sm">
                      No hay {especie.toLowerCase()}s perdidos registrados
                    </div>
                  )}

                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {mascotasFiltradas.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() =>
                          setMascotaSeleccionada(
                            mascotaSeleccionada?.id === m.id ? null : m
                          )
                        }
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                          mascotaSeleccionada?.id === m.id
                            ? "border-indigo-400 bg-indigo-50"
                            : "border-slate-100 hover:border-slate-300 bg-slate-50"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                          {m.foto ? (
                            <img src={m.foto} alt={m.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                              Sin foto
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-800 text-sm truncate">{m.nombre}</div>
                          <div className="text-xs text-slate-400 truncate">
                            {m.direccionFormateada || "Ubicación no especificada"}
                          </div>
                        </div>
                        {mascotaSeleccionada?.id === m.id && (
                          <CheckCircle2 size={18} className="text-indigo-500 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>

                  {mascotaSeleccionada && (
                    <div className="mt-3 px-3 py-2 bg-indigo-50 rounded-xl text-xs text-indigo-600 font-bold flex items-center gap-2">
                      <CheckCircle2 size={13} />
                      Seleccionaste: {mascotaSeleccionada.nombre}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {enviando ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrar Avistamiento"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}