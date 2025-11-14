// auth.config.ts

// ¡ESTA ES LA LÍNEA CORREGIDA!
// Importamos el tipo desde @auth/core/types, NO desde next-auth
import type { NextAuthConfig } from '@auth/core/types';
// --- FIN DEL CAMBIO ---

import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import EmailProvider from 'next-auth/providers/email';
import { Role } from '@prisma/client';

// 'authOptions' ahora se llama 'NextAuthConfig' en V5
export const authConfig: NextAuthConfig = {
  // ... (El resto de tu archivo estaba perfecto)
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'database',
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
  pages: {
    signIn: '/login',
    verifyRequest: '/login/verificar',
    error: '/login/error',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.role = user.role as Role;
      }
      return session;
    },
  },
};