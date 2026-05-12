"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Trash2,
  Edit2,
  AlertCircle,
  Eye,
  MapPin,
  Mail,
  Phone,
  Calendar,
  X,
  Map,
  Save,
  Camera,
} from "lucide-react";
import { CldImage } from "next-cloudinary";

export default function GestionReportes() {
  const [reportes, setReportes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS PARA DETALLE Y EDICIÓN ---
  const [reporteSeleccionado, setReporteSeleccionado] = useState<any | null>(
    null,
  );
  const [editando, setEditando] = useState(false);
  const [datosEdicion, setDatosEdicion] = useState<any>(null);
  const [datosDueno, setDatosDueno] = useState<any | null>(null);

  // 1. Carga inicial
  useEffect(() => {
    const cargarTodosLosReportes = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/explorar`,
        );
        if (res.ok) {
          const data = await res.json();
          setReportes(data);
        }
      } catch (error) {
        toast.error("Error de conexión");
      } finally {
        setLoading(false);
      }
    };
    cargarTodosLosReportes();
  }, []);

  // 2. Cargar datos del dueño cuando se abre el modal
  // Busca esta parte en tu código y reemplázala:
  useEffect(() => {
    const buscarDueno = async () => {
      if (reporteSeleccionado?.userUid) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/firebase/${reporteSeleccionado.userUid}`,
          );
          if (!res.ok) throw new Error("No encontrado");
          const data = await res.json();
          setDatosDueno(data);
        } catch (error) {
          console.error("Error cargando dueño:", error);
          setDatosDueno({ nombre: "Usuario no encontrado", celular: "N/A" });
        }
      }
    };

    buscarDueno();
  }, [reporteSeleccionado]); // Se dispara cada vez que cambias de reporte

  // --- FUNCIONES DE ACCIÓN ---

  const [confirmarEliminar, setConfirmarEliminar] = useState<{
    id: string;
    nombre: string;
  } | null>(null);

  const abrirDetalle = (reporte: any) => {
    setDatosDueno(null); // <--- ESTO ES VITAL: Limpia el dueño anterior
    setReporteSeleccionado(reporte);
    setDatosEdicion({ ...reporte });
    setEditando(false);
  };

  const guardarCambios = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pets/${datosEdicion.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datosEdicion),
        },
      );

      if (res.ok) {
        setReportes((prev) =>
          prev.map((r) => (r.id === datosEdicion.id ? datosEdicion : r)),
        );
        setReporteSeleccionado(datosEdicion);
        setEditando(false);
        toast.success("Reporte actualizado correctamente");
      } else {
        toast.error("Error al guardar cambios");
      }
    } catch (error) {
      toast.error("Error de red");
    }
  };

  const ejecutarEliminacion = async () => {
    if (!confirmarEliminar) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pets/${confirmarEliminar.id}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        setReportes((prev) =>
          prev.filter((r) => r.id !== confirmarEliminar.id),
        );
        toast.success("Eliminado correctamente");
        setConfirmarEliminar(null);
        setReporteSeleccionado(null);
      }
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans text-slate-900">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Reportes
          </h1>
          <p className="text-slate-500">Panel administrativo central</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-sm font-bold text-slate-400 uppercase mr-2 tracking-wider">
            Total:
          </span>
          <span className="text-xl font-black text-indigo-600">
            {reportes.length}
          </span>
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Mascota
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Estado
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Ubicación
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reportes.map((reporte) => (
              <tr
                key={reporte.id}
                className="hover:bg-slate-50/50 transition-all group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 shadow-sm">
                      {reporte.foto && (
                        <CldImage
                          src={reporte.foto}
                          alt=""
                          width="48"
                          height="48"
                          crop="fill"
                        />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">
                        {reporte.nombre}
                      </div>
                      <div className="text-[11px] font-bold text-indigo-500 uppercase">
                        {reporte.especie}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm ${
                      reporte.estado === "PERDIDO"
                        ? "bg-red-100 text-red-600"
                        : reporte.estado === "RECUPERADO"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {reporte.estado}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-500 truncate max-w-[200px] block">
                    {reporte.direccionFormateada}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => abrirDetalle(reporte)}
                      className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() =>
                        setConfirmarEliminar({
                          id: reporte.id,
                          nombre: reporte.nombre,
                        })
                      }
                      className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE DETALLE / EDICIÓN (Estilo Perfil) */}
      {reporteSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-300">
            {/* Header Imagen con Botón Editar */}
            <div className="relative h-56 w-full bg-slate-200">
              {datosEdicion.foto ? (
                <CldImage
                  src={datosEdicion.foto}
                  alt=""
                  width="800"
                  height="400"
                  crop="fill"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Camera size={48} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              <div className="absolute top-6 right-6 flex gap-2">
                <button
                  onClick={() => setEditando(!editando)}
                  className={`p-3 rounded-2xl backdrop-blur-md transition-all font-bold flex items-center gap-2 ${
                    editando
                      ? "bg-amber-500 text-white shadow-lg shadow-amber-200"
                      : "bg-white/20 text-white hover:bg-white/40"
                  }`}
                >
                  {editando ? <X size={20} /> : <Edit2 size={20} />}
                  {editando ? "Cancelar Edición" : "Editar Reporte"}
                </button>
                <button
                  onClick={() => setReporteSeleccionado(null)}
                  className="p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-2xl text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="absolute bottom-6 left-8">
                <h2 className="text-3xl font-black text-white drop-shadow-md">
                  {editando ? "Editando Reporte" : reporteSeleccionado.nombre}
                </h2>
              </div>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Formulario / Info */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">
                      Nombre de la Mascota
                    </label>
                    <input
                      disabled={!editando}
                      value={datosEdicion.nombre}
                      onChange={(e) =>
                        setDatosEdicion({
                          ...datosEdicion,
                          nombre: e.target.value,
                        })
                      }
                      className={`w-full mt-1 px-4 py-3 rounded-2xl border transition-all font-bold ${
                        editando
                          ? "border-indigo-200 bg-indigo-50/30 text-slate-800"
                          : "border-transparent bg-slate-50 text-slate-500"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                        Especie
                      </label>
                      <select
                        disabled={!editando}
                        value={datosEdicion.especie}
                        onChange={(e) =>
                          setDatosEdicion({
                            ...datosEdicion,
                            especie: e.target.value,
                          })
                        }
                        className="w-full mt-1 px-4 py-3 rounded-2xl border-transparent bg-slate-50 text-slate-800 font-bold disabled:opacity-100"
                      >
                        <option value="PERRO">Perro</option>
                        <option value="GATO">Gato</option>
                        <option value="OTRO">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                        Estado
                      </label>
                      <select
                        disabled={!editando}
                        value={datosEdicion.estado}
                        onChange={(e) =>
                          setDatosEdicion({
                            ...datosEdicion,
                            estado: e.target.value,
                          })
                        }
                        className="w-full mt-1 px-4 py-3 rounded-2xl border-transparent bg-slate-50 text-slate-800 font-bold disabled:opacity-100"
                      >
                        <option value="PERDIDO">Perdido</option>
                        <option value="AVISTADO">Avistado</option>
                        <option value="RECUPERADO">Recuperado</option>
                        <option value="RETIRADO">Retirado</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                      Descripción / Señas
                    </label>
                    <textarea
                      disabled={!editando}
                      rows={3}
                      value={datosEdicion.descripcion}
                      onChange={(e) =>
                        setDatosEdicion({
                          ...datosEdicion,
                          descripcion: e.target.value,
                        })
                      }
                      className="w-full mt-1 px-4 py-3 rounded-2xl border-transparent bg-slate-50 text-slate-600 text-sm italic disabled:opacity-100 resize-none"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-5 bg-indigo-50 rounded-[2rem] border border-indigo-100 relative group">
                    <label className="text-[10px] font-black text-indigo-400 uppercase block mb-2 tracking-tighter">
                      Dueño del Reporte
                    </label>
                    <div className="flex items-center gap-3">
                      {/* Si datosDueno tiene información, la mostramos.
          Si es null (porque acabas de abrir el modal), muestra el esqueleto (skeleton) 
      */}
                      {datosDueno ? (
                        <>
                          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-md">
                            {/* Agregamos una validación por si nombre viene vacío o undefined */}
                            {datosDueno.nombre
                              ? datosDueno.nombre.charAt(0).toUpperCase()
                              : "?"}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-indigo-900">
                              {datosDueno.nombre || "Usuario Desconocido"}
                            </div>
                            <div className="text-[10px] text-indigo-400 flex items-center gap-1 font-bold">
                              <Phone size={10} />{" "}
                              {datosDueno.celular || "Sin teléfono"}
                            </div>
                          </div>

                          {/* Debug opcional: Solo para que veas en consola si el UID cambió correctamente */}
                          {console.log(
                            "Renderizando dueño:",
                            datosDueno.nombre,
                          )}
                        </>
                      ) : (
                        /* Estado de carga animado (Mantiene la estética mientras el fetch termina) */
                        <div className="flex items-center gap-3 animate-pulse">
                          <div className="w-10 h-10 bg-indigo-200 rounded-xl flex items-center justify-center text-indigo-300">
                            ?
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 w-24 bg-indigo-200 rounded-md"></div>
                            <div className="h-2 w-16 bg-indigo-200 rounded-md"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                      Dirección del extravío
                    </label>
                    <div className="relative">
                      <MapPin
                        size={16}
                        className="absolute left-4 top-4 text-slate-400"
                      />
                      <input
                        disabled={!editando}
                        value={datosEdicion.direccionFormateada || ""}
                        onChange={(e) =>
                          setDatosEdicion({
                            ...datosEdicion,
                            direccionFormateada: e.target.value,
                          })
                        }
                        className="w-full mt-1 pl-12 pr-4 py-3 rounded-2xl border-transparent bg-slate-50 text-sm font-medium text-slate-600 disabled:opacity-100"
                      />
                    </div>
                  </div>

                  {/* Acciones Finales */}
                  <div className="pt-4 flex flex-col gap-2">
                    {editando ? (
                      <button
                        onClick={guardarCambios}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                      >
                        <Save size={18} /> GUARDAR CAMBIOS
                      </button>
                    ) : (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${reporteSeleccionado.latitud},${reporteSeleccionado.longitud}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                      >
                        <Map size={18} /> RASTREAR EN MAPA
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR (Igual al anterior) */}
      {confirmarEliminar && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[130] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm text-center shadow-2xl">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 size={40} />
            </div>
            <h3 className="text-2xl font-bold">¿Eliminar definitivamente?</h3>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              Esta acción borrará el reporte de{" "}
              <span className="font-bold text-slate-900">
                {confirmarEliminar.nombre}
              </span>{" "}
              de la base de datos y no se puede deshacer.
            </p>
            <div className="grid grid-cols-1 gap-3 mt-8">
              <button
                onClick={ejecutarEliminacion}
                className="py-4 bg-red-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-red-200 hover:bg-red-600 transition-all"
              >
                SÍ, ELIMINAR AHORA
              </button>
              <button
                onClick={() => setConfirmarEliminar(null)}
                className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
