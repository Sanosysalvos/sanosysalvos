"use client";

import React, { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  LogOut, 
  Shield, 
  ArrowLeft 
} from "lucide-react";
import Link from "next/link";

export default function PerfilPage() {
  const router = useRouter();
  
  // Estados para la información del usuario
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Escuchar el estado de la autenticación de Firebase
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          

          const response = await fetch(`http://localhost:8081/api/users/firebase/${user.uid}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          } else {
            setError("No se pudo cargar la información del perfil.");
          }
        } catch (err) {
          console.error("Error al conectar con el backend:", err);
          setError("Error de conexión con el servidor.");
        } finally {
          setLoading(false);
        }
      } else {
        // Si no hay usuario, redirigir al login
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Botón Volver */}
        <Link 
          href="/home" 
          className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" /> Volver al Inicio
        </Link>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100">
          
          {/* Banner Superior con Botón Cerrar Sesión */}
          <div className="bg-indigo-600 h-32 relative">
            <button 
              onClick={handleLogout}
              className="absolute top-4 right-4 flex items-center gap-2 bg-white/10 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-all text-sm font-medium backdrop-blur-sm border border-white/20"
            >
              <LogOut size={16} /> Cerrar Sesión
            </button>
          </div>

          {/* Foto y Nombre Principal */}
          <div className="px-8 pb-8 relative">
            <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg absolute -top-14">
              <div className="bg-slate-100 w-full h-full rounded-xl flex items-center justify-center">
                <User size={50} className="text-slate-400" />
              </div>
            </div>
            
            <div className="mt-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                  {userData?.nombre || "Cargando..."}
                  {userData?.isAdmin && (
                    <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Shield size={12} /> Admin
                    </span>
                  )}
                </h1>
                <p className="text-slate-500 flex items-center gap-2 mt-1">
                  <Mail size={16} /> {userData?.email}
                </p>
              </div>
            </div>

            {/* Grid de Información Detallada */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-1">
                  <CreditCard size={18} className="text-indigo-500" /> RUT
                </div>
                <p className="text-slate-900 font-semibold text-lg bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {userData?.rut || "No especificado"}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-1">
                  <Phone size={18} className="text-indigo-500" /> Celular
                </div>
                <p className="text-slate-900 font-semibold text-lg bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {userData?.celular || "No especificado"}
                </p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-1">
                  <MapPin size={18} className="text-indigo-500" /> Dirección de Residencia
                </div>
                <p className="text-slate-900 font-semibold text-lg bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {userData?.direccionResidencia || userData?.direccion_residencia || "No especificada"}
                </p>
              </div>

            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}