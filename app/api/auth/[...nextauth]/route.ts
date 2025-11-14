// app/api/auth/[...nextauth]/route.ts
// VERSIÓN CORREGIDA (V4)

import NextAuth, { NextAuthOptions } from 'next-auth';
// ¡ESTA ES LA LÍNEA CORREGIDA!
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import EmailProvider from 'next-auth/providers/email';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client'; // Importar tu Enum 'Role'

export const authOptions: NextAuthOptions = {
  // 1. Adaptador de Prisma (Ahora usa el paquete V4 correcto)
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

  // 4. Callbacks (Tus callbacks están correctos)
  // (Estos errores desaparecerán una vez que 'next-auth.d.ts' se lea)
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role as Role;
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