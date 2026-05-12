// app/admin/page.tsx
export default function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Resumen del Sistema</h1>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-bold text-slate-400 uppercase">Tasa de Recuperación</p>
          <p className="text-4xl font-black text-emerald-500 mt-2">37%</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-bold text-slate-400 uppercase">Reportes Totales</p>
          <p className="text-4xl font-black text-slate-800 mt-2">152</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-bold text-slate-400 uppercase">Reportes del Mes</p>
          <p className="text-4xl font-black text-indigo-600 mt-2">+24</p>
        </div>
      </div>

      {/* Visualización de Porcentajes (Simulada con CSS) */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Mascotas Perdidas vs. Encontradas</h2>
        <div className="flex items-center gap-8">
          {/* Gráfico de barra circular simple con Tailwind */}
          <div className="relative w-48 h-48 rounded-full border-[16px] border-indigo-100 flex items-center justify-center">
             <div className="absolute inset-0 rounded-full border-[16px] border-indigo-600 border-t-transparent border-l-transparent -rotate-45"></div>
             <span className="text-2xl font-bold text-slate-700">63%</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-indigo-600 rounded"></div>
              <span className="text-slate-600 font-medium text-lg">Perdidas (96 mascotas)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-indigo-100 rounded"></div>
              <span className="text-slate-600 font-medium text-lg">Encontradas (56 mascotas)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}