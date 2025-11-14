// auth.ts
// VERSIÓN FINAL Y DEFINITIVA (BURLANDO EL CONFLICTO LOCAL)

// 1. CAMBIO CLAVE: Importamos el módulo completo como NextAuth (wildcard import)
//    Esto evita que el compilador se confunda.
import * as NextAuth from 'next-auth'; 

import { authConfig } from './auth.config';
import type { AuthConfig } from '@auth/core/types';

// 2. CORRECCIÓN: Llamamos explícitamente a la función 'default' del objeto NextAuth.
//    Esto es la función que queremos llamar.
const NextAuthInstance = NextAuth.default({
  secret: process.env.AUTH_SECRET, // 👈 Ya tienes el secret en el .env
  ...authConfig 
} as AuthConfig);

// 3. Exporta cada propiedad clave que queremos exponer al resto de la aplicación.
export const handlers = NextAuthInstance.handlers; 
export const auth = NextAuthInstance.auth;
export const signIn = NextAuthInstance.signIn;
export const signOut = NextAuthInstance.signOut;