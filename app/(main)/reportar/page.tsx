"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  AlignLeft,
  Loader2,
  Info,
  UploadCloud,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CldUploadWidget } from "next-cloudinary";

export default function ReportarPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [tipoReporte, setTipoReporte] = useState<"perdido" | "encontrado">(
    "perdido",
  );
  const [nombre, setNombre] = useState("");
  const [especie, setEspecie] = useState("perro");
  const [fecha, setFecha] = useState("");
  const [ubicacion, setUbicacion] = useState(""); // Lo que escribe el usuario
  const [descripcion, setDescripcion] = useState("");
  const [edad, setEdad] = useState<number>(1);
  const [fotoUrl, setFotoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("Debes iniciar sesión para reportar.");
      return;
    }

    if (!fotoUrl) {
      alert("Por favor, sube una foto de la mascota antes de publicar.");
      return;
    }

    setLoading(true);

    const petData = {
      nombre: tipoReporte === "perdido" ? nombre : "Mascota Encontrada",
      especie: especie,
      descripcion: descripcion,
      // CAMBIO CLAVE: Enviamos 'direccionFormateada' para que Java lo reconozca
      direccionFormateada: ubicacion,
      estado: tipoReporte.toUpperCase(),
      userUid: user.uid,
      foto: fotoUrl,
      fechaPerdida: fecha,
      edad: Number(edad),
      latitud: -33.4489,
      longitud: -70.6693,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reportar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(petData),
        },
      );

      if (response.ok) {
        router.push("/perfil");
      } else {
        const errorData = await response.json();
        console.error("Detalles de validación:", errorData);
        alert("Error al guardar. Verifica que los campos sean correctos.");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "block w-full pl-10 pr-3 py-2 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors";

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Link>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Reportar un caso
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            {user
              ? `Hola ${user.displayName || "amigo"}, ayuda a una mascota hoy.`
              : "Inicia sesión para reportar."}
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-slate-200 p-1 rounded-xl inline-flex">
            <button
              type="button"
              onClick={() => setTipoReporte("perdido")}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${tipoReporte === "perdido" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600"}`}
            >
              Perdí mi mascota
            </button>
            <button
              type="button"
              onClick={() => setTipoReporte("encontrado")}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${tipoReporte === "encontrado" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-600"}`}
            >
              Encontré una mascota
            </button>
          </div>
        </div>

        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-slate-100 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* FOTO */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Foto de la mascota
              </label>
              <CldUploadWidget
                uploadPreset="mascotas_preset"
                onSuccess={(results: any) =>
                  setFotoUrl(results.info.secure_url)
                }
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className={`w-full flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-xl transition-all ${fotoUrl ? "border-emerald-500 bg-emerald-50" : "border-slate-300 hover:border-indigo-500 bg-slate-50"}`}
                  >
                    <UploadCloud
                      className={`h-10 w-10 mb-2 ${fotoUrl ? "text-emerald-500" : "text-slate-400"}`}
                    />
                    <span className="text-sm font-medium text-slate-600">
                      {fotoUrl ? "¡Imagen cargada!" : "Subir foto"}
                    </span>
                  </button>
                )}
              </CldUploadWidget>
            </div>

            {/* NOMBRE */}
            {tipoReporte === "perdido" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre de la mascota
                </label>
                <div className="relative">
                  <Info className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    className={inputClasses}
                    placeholder="Ej. Firulais"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required={tipoReporte === "perdido"}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Especie
                </label>
                <select
                  className="block w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white outline-none"
                  value={especie}
                  onChange={(e) => setEspecie(e.target.value)}
                >
                  <option value="perro">Perro</option>
                  <option value="gato">Gato</option>
                  <option value="ave">Ave</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Edad aproximada
                </label>
                <div className="relative">
                  <Info className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    className={`${inputClasses} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                    /* Si es 0 o no tiene valor, mostramos vacío en la pantalla para que no moleste */
                    value={edad === 0 ? "" : edad}
                    onChange={(e) => {
                      const val = e.target.value;

                      // Si el usuario borra todo, le pasamos un 0.
                      // Como arriba pusimos que si es 0 muestre "", la pantalla se mantendrá limpia para escribir libremente.
                      if (val === "") {
                        setEdad(0);
                      } else {
                        setEdad(Number(val));
                      }
                    }}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fecha
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input
                    type="date"
                    className={inputClasses}
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ubicación
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    className={inputClasses}
                    placeholder="Ej. Maipú"
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* DESCRIPCIÓN */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descripción
              </label>
              <div className="relative">
                <AlignLeft className="absolute top-3 left-3 h-5 w-5 text-slate-400" />
                <textarea
                  rows={4}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Señas particulares..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !user}
                className={`w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-sm text-base font-bold text-white transition-colors ${tipoReporte === "perdido" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-emerald-600 hover:bg-emerald-700"} disabled:opacity-50`}
              >
                {loading && <Loader2 className="animate-spin mr-2 h-5 w-5" />}
                {tipoReporte === "perdido"
                  ? "Publicar Mascota Perdida"
                  : "Publicar Mascota Encontrada"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
