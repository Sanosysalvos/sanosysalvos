"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Edit2, MapPin, Phone, CreditCard, Mail, Trash2 } from "lucide-react";
import { CldImage } from "next-cloudinary";
import { toast } from "sonner";
export default function PerfilPage() {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [usuarioAEditar, setUsuarioAEditar] = useState<any>(null);
  // 1. Estado para controlar el modal de confirmación
  const [confirmarEliminar, setConfirmarEliminar] = useState<{
    id: string;
    nombre: string;
  } | null>(null);
  const [mascotaAEditar, setMascotaAEditar] = useState<any | null>(null);
  const handleGuardarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();

    // Intentamos obtener el ID de forma segura:
    // 1. Del perfil cargado (id interno o firebase_uid)
    // 2. Directamente del user del AuthContext (user.uid)
    const userId =
      perfil?.usuario?.id || perfil?.usuario?.firebase_uid || user?.uid;

    if (!userId) {
      toast.error("No se pudo identificar al usuario");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(usuarioAEditar),
        },
      );

      if (res.ok) {
        // Intentamos parsear la respuesta por si el backend devuelve el objeto actualizado
        const data = await res.json().catch(() => usuarioAEditar);

        // Actualizamos el estado local
        setPerfil((prev: any) => ({
          ...prev,
          usuario: { ...prev.usuario, ...data },
        }));

        toast.success("Perfil actualizado", {
          description: "Tu información personal se ha guardado con éxito.",
        });

        setUsuarioAEditar(null);
      } else {
        const errorText = await res.text();
        console.error("Error del servidor:", errorText);
        toast.error("No se pudo actualizar el perfil");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      toast.error("Error de conexión");
    }
  };

  const handleGuardarCambios = async (e: React.FormEvent) => {
    e.preventDefault(); // Esto evita que la página se recargue

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pets/${mascotaAEditar.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mascotaAEditar),
        },
      );

      if (res.ok) {
        // Actualizamos la lista local para que el cambio se vea al instante
        setPerfil((prev: any) => ({
          ...prev,
          mascotas: prev.mascotas.map((m: any) =>
            m.id === mascotaAEditar.id ? mascotaAEditar : m,
          ),
        }));

        // --- AQUÍ VA EL CÓDIGO DE SONNER ---
        toast.success("¡Mascota actualizada!", {
          description: `Los cambios de ${mascotaAEditar.nombre} se guardaron correctamente.`,
        });
        // ----------------------------------

        setMascotaAEditar(null); // Cerramos el modal
      } else {
        toast.error("Hubo un problema al guardar los cambios");
      }
    } catch (error) {
      toast.error("Error de conexión con el servidor");
      console.error(error);
    }
  };
  // Carga inicial del perfil (BFF)
  useEffect(() => {
    const cargarPerfil = async () => {
      if (!user) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/perfil/${user.uid}`,
        );
        if (res.ok) {
          const data = await res.json();
          setPerfil(data);
        }
      } catch (error) {
        console.error("Error al cargar perfil:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarPerfil();
  }, [user]);

  // 2. Función para abrir el modal
  const abrirConfirmacion = (id: string, nombre: string) => {
    setConfirmarEliminar({ id, nombre });
  };

  // 3. Función para ejecutar el borrado real
  const ejecutarEliminacion = async () => {
    if (!confirmarEliminar) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080"}/api/pets/${confirmarEliminar.id}`,
        {
          method: "DELETE",
        },
      );

      if (res.ok) {
        setPerfil((prev: any) => ({
          ...prev,
          mascotas: prev.mascotas.filter(
            (m: any) => m.id !== confirmarEliminar.id,
          ),
        }));
        toast.success("Eliminado correctamente");
        setConfirmarEliminar(null);
      } else {
        alert("No se pudo eliminar el reporte.");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error de conexión.");
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center animate-pulse text-indigo-600 font-medium">
        Cargando tu perfil...
      </div>
    );
  if (!perfil)
    return (
      <div className="p-20 text-center text-slate-500">
        No se encontró el perfil en la base de datos local.
      </div>
    );

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-grow">
        {/* ENCABEZADO */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Mi Perfil</h1>
          <p className="text-slate-500 text-sm">
            Gestiona tu información y reportes de mascotas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PANEL IZQUIERDO: USUARIO */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-24 w-full relative">
                <button
                  onClick={() => setUsuarioAEditar(perfil.usuario)} // <--- Añadir esto
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors"
                  title="Editar Perfil"
                >
                  <Edit2 size={16} />
                </button>
              </div>
              <div className="px-6 pb-6 text-center">
                <div className="relative -mt-12 mb-4 inline-block">
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600 shadow-md">
                    {perfil.usuario.nombre.charAt(0)}
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                  {perfil.usuario.nombre}
                </h2>
                <div className="flex items-center justify-center text-slate-500 text-sm mt-1 gap-1">
                  <Mail size={14} /> {perfil.usuario.email}
                </div>

                <hr className="my-6 border-slate-100" />

                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase">
                        RUT / ID
                      </p>
                      <p className="text-sm font-semibold">
                        {perfil.usuario.rut || "No registrado"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase">
                        Celular
                      </p>
                      <p className="text-sm font-semibold">
                        {perfil.usuario.celular || "No registrado"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase">
                        Residencia
                      </p>
                      <p className="text-sm font-semibold truncate w-48">
                        {perfil.usuario.direccionResidencia || "No registrada"}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setUsuarioAEditar(perfil.usuario)} // <--- Añadir esto
                  className="w-full mt-8 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Editar Información Personal
                </button>
              </div>
            </div>
          </div>

          {/* PANEL DERECHO: MASCOTAS */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              Mis Reportes Activos
              <span className="text-sm font-normal bg-slate-200 px-2 py-0.5 rounded-full text-slate-600">
                {perfil.mascotas.length}
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {perfil.mascotas.map((m: any) => (
                <Link
                  key={m.id}
                  href={`/mascota/${m.id}`}
                  className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 relative flex flex-col"
                >
                  {/* CONTENEDOR DE IMAGEN Y BOTONES FLOTANTES */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    {m.foto ? (
                      <CldImage
                        src={m.foto}
                        alt={m.nombre}
                        width="400"
                        height="300"
                        crop="fill"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-300">
                        Sin foto
                      </div>
                    )}

                    {/* Badge de Estado - ¡Actualizado con 3 colores dinámicos! */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-sm ${
                          m.estado?.toUpperCase() === "PERDIDO"
                            ? "bg-rose-500"
                            : ["RECUPERADO", "RETIRADO", "ENCONTRADO"].includes(
                                  m.estado?.toUpperCase(),
                                )
                              ? "bg-emerald-500"
                              : "bg-sky-500"
                        }`}
                      >
                        {m.estado}
                      </span>
                    </div>

                    {/* BOTÓN ELIMINAR */}
                    <button
                      onClick={(e) => {
                        e.preventDefault(); // Evita navegar al detalle
                        e.stopPropagation(); // Evita que el click llegue al Link
                        abrirConfirmacion(m.id, m.nombre);
                      }}
                      className="absolute top-3 right-3 p-2.5 bg-white/90 hover:bg-red-500 text-red-500 hover:text-white backdrop-blur-md rounded-full shadow-lg border border-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 z-10"
                      title="Eliminar reporte"
                    >
                      <Trash2 size={18} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* INFO DE LA MASCOTA */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-slate-900">
                        {m.nombre}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin size={12} />{" "}
                        {m.direccionFormateada || "Ubicación no especificada"}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault(); // Evita navegar al detalle
                        e.stopPropagation(); // Evita que el click llegue al Link
                        setMascotaAEditar(m);
                      }}
                      className="mt-auto flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-colors"
                    >
                      <Edit2 size={14} /> Editar
                    </button>
                  </div>
                </Link>
              ))}
              {perfil.mascotas.length === 0 && (
                <div className="col-span-full py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center">
                  <p className="text-slate-400 font-medium">
                    Aún no has reportado ninguna mascota.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MODAL DE CONFIRMACIÓN (Al final del layout) */}
        {confirmarEliminar && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                  <Trash2 size={36} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  ¿Estás seguro?
                </h3>
                <p className="text-slate-500 mt-2">
                  Vas a eliminar el reporte de{" "}
                  <span className="font-bold text-slate-800">
                    {confirmarEliminar.nombre}
                  </span>
                  .
                </p>
                <div className="grid grid-cols-2 w-full gap-3 mt-10">
                  <button
                    onClick={() => setConfirmarEliminar(null)}
                    className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={ejecutarEliminacion}
                    className="py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200 transition-all active:scale-95"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {mascotaAEditar && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            {/* Fondo del modal ahora es blanco puro con sombra profunda */}
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900">
                  Editar Reporte
                </h3>
                <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full uppercase">
                  ID: {mascotaAEditar.id.slice(0, 8)}
                </span>
              </div>

              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
                onSubmit={handleGuardarCambios}
              >
                {/* Usaremos un fondo ligeramente gris para los campos para que resalten sobre el blanco del modal */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase ml-1">
                    Nombre de la Mascota
                  </label>
                  <input
                    type="text"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-700 font-medium"
                    value={mascotaAEditar.nombre}
                    onChange={(e) =>
                      setMascotaAEditar({
                        ...mascotaAEditar,
                        nombre: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase ml-1">
                    Edad Aproximada
                  </label>
                  <input
                    type="number"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 font-medium"
                    value={mascotaAEditar.edad}
                    onChange={(e) =>
                      setMascotaAEditar({
                        ...mascotaAEditar,
                        edad: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase ml-1">
                    Especie
                  </label>
                  <select
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 font-medium appearance-none"
                    value={mascotaAEditar.especie}
                    onChange={(e) =>
                      setMascotaAEditar({
                        ...mascotaAEditar,
                        especie: e.target.value,
                      })
                    }
                  >
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Ave">Ave</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase ml-1">
                    Estado
                  </label>
                  <select
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 font-medium appearance-none"
                    value={mascotaAEditar.estado}
                    onChange={(e) =>
                      setMascotaAEditar({
                        ...mascotaAEditar,
                        estado: e.target.value,
                      })
                    }
                  >
                    <option value="PERDIDO">PERDIDO</option>
                    <option value="RECUPERADO">RECUPERADO</option>
                    <option value="RETIRADO">RETIRADO</option>
                    <option value="AVISTADO">AVISTADO</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase ml-1">
                    Descripción de los hechos
                  </label>
                  <textarea
                    rows={3}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 font-medium resize-none"
                    value={mascotaAEditar.descripcion}
                    onChange={(e) =>
                      setMascotaAEditar({
                        ...mascotaAEditar,
                        descripcion: e.target.value,
                      })
                    }
                  />
                </div>

                {/* BOTONES */}
                <div className="md:col-span-2 flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setMascotaAEditar(null)}
                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all"
                  >
                    Descartar
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
                  >
                    Confirmar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {usuarioAEditar && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-3 border-4 border-white shadow-md">
                  {usuarioAEditar.nombre?.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Editar Perfil
                </h3>
                <p className="text-slate-500 text-sm">{usuarioAEditar.email}</p>
              </div>

              <form className="space-y-4" onSubmit={handleGuardarUsuario}>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase ml-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    className="w-full p-3.5 bg-slate-50 border text-slate-900 border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={usuarioAEditar.nombre || ""}
                    onChange={(e) =>
                      setUsuarioAEditar({
                        ...usuarioAEditar,
                        nombre: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase ml-1">
                      RUT / ID
                    </label>
                    <input
                      type="text"
                      className="w-full p-3.5 bg-slate-50 border text-slate-900 border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={usuarioAEditar.rut || ""}
                      onChange={(e) =>
                        setUsuarioAEditar({
                          ...usuarioAEditar,
                          rut: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase ml-1">
                      Celular
                    </label>
                    <input
                      type="text"
                      className="w-full p-3.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={usuarioAEditar.celular || ""}
                      onChange={(e) =>
                        setUsuarioAEditar({
                          ...usuarioAEditar,
                          celular: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase ml-1">
                    Dirección de Residencia
                  </label>
                  <input
                    type="text"
                    className="w-full p-3.5 text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={usuarioAEditar.direccionResidencia || ""}
                    onChange={(e) =>
                      setUsuarioAEditar({
                        ...usuarioAEditar,
                        direccionResidencia: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setUsuarioAEditar(null)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 shadow-lg transition-all active:scale-95"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
