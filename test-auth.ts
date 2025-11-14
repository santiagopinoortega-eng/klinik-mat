// test-auth.ts
import { AuthConfig } from '@auth/core/types';
import { authConfig } from './auth.config';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './lib/prisma';
import EmailProvider from 'next-auth/providers/email';
import NextAuth from 'next-auth';

// 1. Definir la configuración completa (sin el wrapper de NextAuth)
const fullAuthConfig: AuthConfig = {
    ...authConfig,
    secret: process.env.AUTH_SECRET,
    adapter: PrismaAdapter(prisma),
    session: { strategy: 'database' },
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

// 2. Intentar inicializar Auth.js directamente
try {
    // La línea que falla en tu servidor es la que inicializa NextAuth.
    // Al hacerlo aquí, forzamos un crash limpio de Node.js.
    NextAuth(fullAuthConfig); 
    console.log("✅ DIAGNÓSTICO EXITOSO: Auth está funcionando.");
} catch (error) {
    console.error("❌ ERROR CRÍTICO EN LA INICIALIZACIÓN DE DEPENDENCIAS:");
    console.error(error);
}