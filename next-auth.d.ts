// next-auth.d.ts
import { Role } from '@prisma/client'; // Importa tu Enum
import 'next-auth'; // Importante: importa el módulo original

/**
 * Aumenta (extiende) los tipos por defecto de NextAuth
 */
declare module 'next-auth' {
  
  /**
   * Extiende la interfaz 'Session'
   * Esto es lo que `useSession` y `getServerSession` devolverán.
   */
  interface Session {
    user: {
      id: string;   // Añade nuestro ID de la DB
      role: Role;   // Añade nuestro Rol de la DB
    } & DefaultSession['user']; // Mantiene name, email, image
  }

  /**
   * Extiende la interfaz 'User'
   * Esto representa el modelo 'User' de tu base de datos (Prisma).
   */
  interface User {
    role: Role; // Asegúrate de que el objeto User que pasa el Adapter tenga el rol
  }
}