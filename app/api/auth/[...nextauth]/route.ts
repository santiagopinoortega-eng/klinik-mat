// app/api/auth/[...nextauth]/route.ts
// VERSIÓN CORREGIDA Y SIMPLIFICADA

import NextAuth, { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import EmailProvider from 'next-auth/providers/email';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client'; // Importar tu Enum 'Role'

export const authOptions: NextAuthOptions = {
  // 1. Adaptador de Prisma
  adapter: PrismaAdapter(prisma),

  // 2. Providers
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
  
  // 3. Estrategia de Sesión
  session: {
    strategy: 'database',
  },

  // 4. Callbacks (Aquí es donde los errores 3 y 4 desaparecerán)
  callbacks: {
    async session({ session, user }) {
      // 'user' viene de la DB (Adapter)
      // 'session.user' es lo que irá al cliente
      if (session.user) {
        session.user.id = user.id; // OK (si .d.ts existe)
        session.user.role = user.role as Role; // OK (si .d.ts existe)
      }
      return session;
    },
  },
  
  // 5. Páginas personalizadas
  pages: {
    signIn: '/login',
    verifyRequest: '/login/verificar',
    error: '/login/error', // Página para mostrar errores de login
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };