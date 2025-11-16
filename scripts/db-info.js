// scripts/db-info.js
// Muestra información de conexión para DATABASE_URL y DATABASE_URL_DEV
// Uso: `node scripts/db-info.js` (carga .env.local) y compara ambas URLs si existen

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Cargar .env.local si existe
try {
  const localEnvPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(localEnvPath)) {
    dotenv.config({ path: localEnvPath });
  }
} catch (e) {
  // ignore
}

async function getInfoForUrl(url) {
  if (!url) return null;
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const rows = await prisma.$queryRawUnsafe(`select current_database() as db, current_user as user, inet_server_addr() as addr, inet_server_port() as port, version() as version`);
    const info = Array.isArray(rows) && rows[0] ? rows[0] : rows;
    return {
      urlSummary: url.replace(/^(postgresql:\/\/)([^:@]+)(:[^@]+)?@/, '$1$2:***@'),
      database: info.db || null,
      user: info.user || null,
      addr: info.addr || null,
      port: info.port || null,
      version: info.version || null,
    };
  } catch (e) {
    return { error: String(e) };
  } finally {
    await prisma.$disconnect();
  }
}

(async function main() {
  const url = process.env.DATABASE_URL || null;
  const urlDev = process.env.DATABASE_URL_DEV || null;

  console.log('Comprobando conexiones...');

  const infoMain = await getInfoForUrl(url);
  const infoDev = await getInfoForUrl(urlDev);

  console.log('\nDATABASE_URL:');
  console.log(infoMain || '  (no definida)');

  console.log('\nDATABASE_URL_DEV:');
  console.log(infoDev || '  (no definida)');

  if (infoMain && infoDev && !infoMain.error && !infoDev.error) {
    const sameAddr = infoMain.addr === infoDev.addr && infoMain.port === infoDev.port && infoMain.database === infoDev.database;
    console.log('\nResultado:');
    if (sameAddr) console.log('  Las dos URLs apuntan a la MISMA instancia/BD (mismo host, puerto y nombre de BD).');
    else console.log('  Las URLs apuntan a INSTANCIAS/BD distintas (o la información de red difiere).');
  } else {
    console.log('\nNo se pudo comparar completamente (una URL no está definida o hubo error).');
  }
})();
