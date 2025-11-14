// app/middleware.ts
// Importa el helper de middleware de NextAuth v4
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // `withAuth` decodifica el token y lo pasa al 'req'
  function middleware(req) {
    // 1. OBTENEMOS EL TOKEN
    // 'req.nextauth.token' solo existe porque 'withAuth' lo inyectó.
    const token = req.nextauth.token;

    // 2. LÓGICA DE AUTORIZACIÓN (Roles)
    // Este es un ejemplo para tu rol de EDITOR/ADMIN
    const pathname = req.nextUrl.pathname;
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      // Si intenta entrar a /admin pero no es Admin, lo negamos.
      return new NextResponse("Acceso Denegado: No eres Administrador", { status: 403 });
    }
    
    // 3. SI LLEGA AQUÍ, ESTÁ AUTENTICADO Y AUTORIZADO
    // Dejamos que continúe a la página que solicitó (ej: /casos/123)
    return NextResponse.next();
  },
  {
    // 3. CONFIGURACIÓN DE 'withAuth'
    callbacks: {
      // Esta función decide si el usuario está "autorizado"
      // Si 'token' existe (está logueado), devuelve true.
      authorized: ({ token }) => !!token,
    },
    pages: {
      // 4. PÁGINA DE REDIRECCIÓN
      // Si 'authorized' devuelve false, el middleware redirigirá
      // al usuario a esta página.
      signIn: "/login",
    },
  }
);

// 5. EL MATCHER
// Aquí es donde le decimos al middleware en QUÉ RUTAS debe ejecutarse.
// Es el "guardia de seguridad" en puertas específicas.
export const config = {
  matcher: [
    /*
     * Aplica el middleware a todas estas rutas:
     */
    "/casos/:path*", // Todas las páginas de casos individuales
    "/mi-progreso", // Una futura página de perfil/progreso
    "/admin/:path*", // Todas las rutas de administración
  ],
};