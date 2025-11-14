// auth.config.ts

// 1. CORRECCIÓN: Importamos 'AuthConfig' (el tipo correcto de V5)
import type { AuthConfig } from '@auth/core/types';

import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import EmailProvider from 'next-auth/providers/email';
import { Role } from '@prisma/client';

// 2. CORRECCIÓN: Usamos el tipo 'AuthConfig'
export const authConfig: AuthConfig = {
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
    // 3. CORRECCIÓN: Al usar 'AuthConfig' (el tipo correcto),
    // TypeScript ahora entiende qué son 'session' y 'user',
    // eliminando los errores de 'any'.
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.role = user.role as Role;
      }
      return session;
    },
  },
};