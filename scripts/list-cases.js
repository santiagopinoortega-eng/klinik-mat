// scripts/list-cases.js
// Lista los últimos 25 casos usando .env.local (dotenv)
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

// Cargar .env.local si existe
try {
  const localEnvPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(localEnvPath)) {
    dotenv.config({ path: localEnvPath });
  }
} catch (e) {
  // no fatal
}

// Si no hay DATABASE_URL, usar DATABASE_URL_DEV como fallback
if (!process.env.DATABASE_URL && process.env.DATABASE_URL_DEV) {
  console.warn('WARNING: `DATABASE_URL` vacío, usando `DATABASE_URL_DEV` como fallback.');
  process.env.DATABASE_URL = process.env.DATABASE_URL_DEV;
}

if (!process.env.DATABASE_URL) {
  console.error('ERROR: `DATABASE_URL` no está definida. Define `DATABASE_URL` o `DATABASE_URL_DEV` en .env.local o en el entorno.');
  process.exit(1);
}

(async function main() {
  const prisma = new PrismaClient();
  try {
    const count = await prisma.case.count();
    console.log('count =', count);
    const rows = await prisma.case.findMany({
      orderBy: { createdAt: 'desc' },
      take: 25,
      select: { id: true, title: true, area: true, difficulty: true, createdAt: true }
    });
    console.log(JSON.stringify(rows, null, 2));
  } catch (e) {
    console.error('Error listando casos:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
