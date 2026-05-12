// frontend/app/layout.tsx
import Header from "../components/header";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "sonner"; // 1. Importamos Toaster
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        <AuthProvider>
          {/* 2. Colocamos el Toaster. 
             'richColors' hace que el éxito sea verde y el error rojo.
             'expand' hace que si hay varias notificaciones se apilen bonito.
          */}
          <Toaster position="top-right" richColors expand={false} />

          <Header />

          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
