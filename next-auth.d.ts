// types/next-auth.d.ts o en la raíz del proyecto

// Extiende el tipo User para incluir 'id' y 'role'
declare module 'next-auth' {
  /**
   * El objeto User que se devuelve en los callbacks (jwt, session)
   * y que se pasa al adaptador. Importamos Role aquí dentro.
   */
  interface User {
    role: import('@prisma/client').Role;
    id: string;
  }

  /**
   * El objeto Session que se devuelve desde `useSession` o `getSession`.
   */
  interface Session {
    user: {
      id: string; // id del usuario
      role: import('@prisma/client').Role; // rol del usuario
    } & {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

// Extiende el tipo JWT para incluir 'id' y 'role'
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: import('@prisma/client').Role;
  }
}
