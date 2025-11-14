// middleware.ts
// VERSIÓN CORREGIDA (IMPORTA SOLO EL ARCHIVO EDGE-SAFE)

import NextAuth from 'next-auth';
// 1. Importa la config "ligera" (que es Edge-safe)
import { authConfig } from './auth.config';
import type { AuthConfig as V5AuthConfig } from '@auth/core/types';

// 2. Inicializa solo con la config Edge-safe
const { auth } = NextAuth(authConfig as V5AuthConfig);

// 3. La lógica de 'authorized' (que está en auth.config.ts)
//    se encargará de la redirección automáticamente.
export default auth; 

// 4. EL MATCHER (sigue igual)
export const config = {
  matcher: [
    '/casos/:path*',
    '/mi-progreso',
    '/admin/:path*',
  ],
};