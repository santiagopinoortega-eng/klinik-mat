// auth.config.ts
import type { AuthConfig } from '@auth/core/types';
import { Role } from '@prisma/client';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@auth/prisma-adapter';

// 'authOptions' ahora se llama 'NextAuthConfig' en V5
export const authConfig: AuthConfig = {
  
  // 1. MOVIMIENTO CRÍTICO: 'authorized' va a la raíz de la configuración.
  authorized({ auth, request: { nextUrl } }) {
    // Si la sesión existe, el token existe.
    const isLoggedIn = !!auth?.user;
    const pathname = nextUrl.pathname;

    // Aquí definimos qué rutas están protegidas
    if (pathname.startsWith('/admin') || pathname.startsWith('/casos')) {
        if (!isLoggedIn) return false; // Si no está logueado, redirige a /login

        // Lógica de rol específica para admin
        if (pathname.startsWith('/admin') && auth.user.role !== Role.ADMIN) {
            return false; // Denegar acceso
        }
    }
    
    // Permitir acceso a todas las rutas públicas (como /login, /)
    return true; 
  },
  
  // 2. El objeto 'callbacks' solo contiene funciones de ciclo de vida (session, signIn, etc.)
  callbacks: {
    // Este callback inyecta id y rol en la sesión
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.role = user.role as Role;
      }
      return session;
    },
    // El callback 'authorized' SE QUITA de aquí
  },

  // ... El resto de la configuración es correcta ...
  pages: {
    signIn: '/login',
    verifyRequest: '/login/verificar',
    error: '/login/error',
  },
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
};