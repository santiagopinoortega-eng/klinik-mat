// auth.ts
import NextAuth from 'next-auth';
// 1. Importa la configuración (como ya lo tenías)
import { authConfig } from './auth.config';
// 2. Importa el TIPO que acabamos de corregir (para ser explícitos)
import type { AuthConfig } from '@auth/core/types';

// Aquí es donde V5 separa los handlers
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  // 3. CAMBIO: Hacemos un "cast" explícito a AuthConfig
  //    Esto le asegura a TypeScript que authConfig tiene el tipo correcto.
} = NextAuth(authConfig as AuthConfig);