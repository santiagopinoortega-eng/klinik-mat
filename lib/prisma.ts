// /lib/prisma.ts
import { PrismaClient } from '@prisma/client';

<<<<<<< HEAD
// Declaramos una variable global para almacenar la instancia de Prisma.
// Esto es clave para evitar crear nuevas conexiones en cada hot-reload en desarrollo.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Exportamos una única instancia de PrismaClient.
// Si ya existe en el objeto global, la reutilizamos. Si no, creamos una nueva.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Opcional: Log de errores en desarrollo. En producción, es mejor usar un servicio de logging.
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// En entornos que no son de producción, asignamos la instancia de Prisma al objeto global.
// Esto asegura que la misma instancia se reutilice en las recargas de la aplicación.
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
=======
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaRO?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? [] : (['error'] as const),
  });

export const prismaRO =
  globalForPrisma.prismaRO ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL_READONLY || process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'production' ? [] : (['error'] as const),
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaRO = prismaRO;
>>>>>>> 68bff7b924ecf91be37b4416b61edb52aac487e6
}